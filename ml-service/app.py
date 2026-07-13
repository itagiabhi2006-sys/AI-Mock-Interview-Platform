import os
import time
import asyncio
import logging
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache

import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import language_tool_python
import re
import nltk
from nltk.corpus import stopwords

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Download NLTK resources (run once)
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)

app = FastAPI()

# --- Model selection -------------------------------------------------------
# 'all-mpnet-base-v2' is high quality but noticeably slower (~420MB, 768-dim).
# 'all-MiniLM-L6-v2' is roughly 5x faster on CPU with a small accuracy
# tradeoff, and is usually the right default for a real-time evaluation
# endpoint. Override via env var if you want to A/B test quality vs speed.
MODEL_NAME = os.environ.get("EVAL_MODEL_NAME", "all-MiniLM-L6-v2")
logger.info(f"Loading embedding model: {MODEL_NAME}")
model = SentenceTransformer(MODEL_NAME)

# --- Grammar tool setup with graceful degradation ---------------------------
# If Java isn't installed/found, language_tool_python silently falls back to
# the free public LanguageTool API over the network, which is rate-limited
# and can take 5-20+ seconds per call. We try local first, and if init fails
# entirely, we disable grammar checking rather than let every request hang
# or crash.
GRAMMAR_TIMEOUT_SECONDS = float(os.environ.get("GRAMMAR_TIMEOUT_SECONDS", "5"))
GRAMMAR_MAX_CHARS = int(os.environ.get("GRAMMAR_MAX_CHARS", "2000"))

tool = None
try:
    tool = language_tool_python.LanguageTool('en-US')
    logger.info("LanguageTool initialized successfully.")
except Exception as e:
    logger.error(f"LanguageTool failed to initialize, grammar scoring disabled: {e}")

stop_words = set(stopwords.words('english'))

# Thread pool used to run grammar-check and concept-extraction concurrently
# instead of sequentially — they don't depend on each other, so there's no
# reason to pay their cost back-to-back. Also used so blocking CPU-bound
# work doesn't freeze the async event loop (see run_in_executor usage below).
executor = ThreadPoolExecutor(max_workers=4)

RELEVANCE_THRESHOLD = 0.25


class EvaluateRequest(BaseModel):
    question: str
    idealAnswer: str
    userAnswer: str


class EvaluateResponse(BaseModel):
    similarity: float
    grammar: float
    concept_coverage: float
    confidence: float
    final_score: float
    feedback: str


class Timer:
    """Small helper to log elapsed time for each stage so we can see
    exactly where time is going in the logs."""
    def __init__(self, label: str):
        self.label = label

    def __enter__(self):
        self.start = time.perf_counter()
        return self

    def __exit__(self, *args):
        elapsed = time.perf_counter() - self.start
        logger.info(f"⏱️  {self.label}: {elapsed * 1000:.0f}ms")


# Cache ideal-answer embeddings — the ideal answer for a given question
# never changes, so repeated submissions to the same question skip
# re-encoding it. Keyed on the raw text (safe since it's deterministic).
@lru_cache(maxsize=1024)
def encode_cached(text: str):
    return model.encode(text)


def extract_key_concepts(text: str):
    vectorizer = CountVectorizer(max_features=20, stop_words='english', ngram_range=(1, 2))
    try:
        X = vectorizer.fit_transform([text])
        feature_names = vectorizer.get_feature_names_out()
        scores = X.toarray()[0]
        sorted_indices = np.argsort(scores)[::-1]
        top_terms = [feature_names[i] for i in sorted_indices if scores[i] > 0][:10]
        return set(top_terms)
    except Exception as e:
        logger.error(f"Error extracting concepts: {e}")
        return set()


def compute_concept_score(ideal: str, user_ans: str) -> float:
    if not ideal:
        return 0.0
    ideal_concepts = extract_key_concepts(ideal)
    user_concepts = extract_key_concepts(user_ans)
    overlap = len(ideal_concepts & user_concepts)
    return round(min(10, (overlap / max(1, len(ideal_concepts))) * 10), 1)


def compute_grammar_score(user_ans: str) -> float:
    # If LanguageTool failed to initialize at startup, skip gracefully
    # instead of throwing on every request.
    if tool is None:
        return 5.0  # neutral fallback score

    # Cap text length sent to LanguageTool — rule-checking cost scales with
    # length, and very long answers are the main driver of multi-second
    # grammar checks.
    text = user_ans[:GRAMMAR_MAX_CHARS]

    try:
        matches = tool.check(text)
        error_penalty = min(10, len(matches) * 0.5)
        return round(min(10, max(0, 10 - error_penalty)), 1)
    except Exception as e:
        logger.error(f"Grammar check failed, using fallback score: {e}")
        return 5.0  # neutral fallback score so one flaky dependency doesn't fail the request


async def run_with_timeout(func, *args, timeout=None):
    """Run a blocking function in the thread pool without blocking the
    event loop, optionally enforcing a timeout so one slow dependency
    (e.g. LanguageTool) can't stall the whole request indefinitely."""
    loop = asyncio.get_running_loop()
    future = loop.run_in_executor(executor, func, *args)
    if timeout is None:
        return await future
    try:
        return await asyncio.wait_for(future, timeout=timeout)
    except asyncio.TimeoutError:
        logger.warning(f"{func.__name__} timed out after {timeout}s, using fallback.")
        return None


@app.post("/evaluate", response_model=EvaluateResponse)
async def evaluate(req: EvaluateRequest):
    request_start = time.perf_counter()
    logger.info(f"🚀 New evaluation request at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    user_ans = req.userAnswer.strip()
    ideal = req.idealAnswer.strip()

    if len(user_ans) < 10 or len(user_ans.split()) < 4:
        logger.warning("Answer too short or empty — skipping full evaluation.")
        return EvaluateResponse(
            similarity=0.0, grammar=0.0, concept_coverage=0.0,
            confidence=0.0, final_score=0.0,
            feedback="Answer is too short or incomplete."
        )

    # --- Embeddings (batched, cached where possible) ---
    # encode() is CPU-bound and synchronous, so it also runs off the event
    # loop via run_in_executor to keep the server responsive to other
    # requests while this one is computing.
    with Timer("Embedding (relevance check)"):
        reference_text = ideal if ideal else req.question
        emb_reference, emb_user = await asyncio.gather(
            run_with_timeout(encode_cached, reference_text),
            run_with_timeout(model.encode, user_ans),
        )

        raw_similarity = float(cosine_similarity([emb_reference], [emb_user])[0][0])
        raw_similarity = min(1.0, max(0.0, raw_similarity))
        sim_score = round(min(10, max(0, raw_similarity * 10)), 1)

    # --- Relevance gate: stop early if off-topic ---
    if raw_similarity < RELEVANCE_THRESHOLD:
        logger.warning(f"Failed relevance gate ({raw_similarity:.3f} < {RELEVANCE_THRESHOLD}) — skipping rest of pipeline.")
        low_score = round((raw_similarity / RELEVANCE_THRESHOLD) * 15, 1)
        low_score = min(15.0, max(0.0, low_score))
        total_elapsed = time.perf_counter() - request_start
        logger.info(f"✅ Request complete in {total_elapsed * 1000:.0f}ms (short-circuited on relevance)")
        return EvaluateResponse(
            similarity=sim_score, grammar=0.0, concept_coverage=0.0,
            confidence=0.0, final_score=low_score,
            feedback=(
                "Your answer does not appear to be relevant to the question "
                "or the expected answer. Please address the question directly "
                "before re-submitting."
            )
        )

    # --- Grammar + concept coverage run CONCURRENTLY, off the event loop ---
    # Grammar checking gets a timeout since LanguageTool is the most likely
    # source of multi-second stalls (Java server or public-API fallback).
    with Timer("Grammar + concept coverage (parallel)"):
        grammar_score, concept_score = await asyncio.gather(
            run_with_timeout(compute_grammar_score, user_ans, timeout=GRAMMAR_TIMEOUT_SECONDS),
            run_with_timeout(compute_concept_score, ideal, user_ans),
        )
        if grammar_score is None:
            grammar_score = 5.0  # fallback if it timed out

    # --- Confidence (cheap, pure Python — negligible cost, no need to parallelize) ---
    with Timer("Confidence metrics"):
        sentences = re.split(r'[.!?]+', user_ans)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 5]
        num_sentences = len(sentences)
        avg_len = np.mean([len(s.split()) for s in sentences]) if sentences else 0

        domain_word_ratio = 0.0
        if ideal:
            ideal_words = set(re.findall(r'\b\w+\b', ideal.lower()))
            user_words = set(re.findall(r'\b\w+\b', user_ans.lower()))
            if len(ideal_words) > 0:
                domain_word_ratio = len(ideal_words & user_words) / len(ideal_words)

        confidence = min(10,
            (len(user_ans.split()) / 30) * 3 +
            (num_sentences / 3) * 2 +
            (avg_len / 15) * 2 +
            (domain_word_ratio * 3)
        )
        confidence = round(min(10, max(0, confidence)), 1)

    # --- Final score ---
    final = (sim_score * 0.35 + concept_score * 0.30 + grammar_score * 0.15 + confidence * 0.20)
    final = round(final * 10, 1)

    # --- Feedback ---
    feedback_parts = []
    feedback_parts.append(
        "Your answer differs significantly from the expected ideal." if sim_score < 4 else
        "Your answer partially matches the expected response." if sim_score < 7 else
        "Your answer is semantically close to the ideal answer."
    )
    feedback_parts.append(
        "You missed key concepts that should have been covered." if concept_score < 4 else
        "You covered some important points, but not all." if concept_score < 7 else
        "You covered most of the essential concepts."
    )
    feedback_parts.append(
        "There are noticeable grammatical errors." if grammar_score < 5 else
        "Minor grammatical issues detected." if grammar_score < 8 else
        "Good grammar and sentence structure."
    )
    feedback_parts.append(
        "Your answer seems incomplete or lacks depth." if confidence < 4 else
        "Your answer is reasonably detailed but could be more comprehensive." if confidence < 7 else
        "Your answer is well-structured and thorough."
    )
    feedback_text = " ".join(feedback_parts)

    total_elapsed = time.perf_counter() - request_start
    logger.info(f"✅ Request complete in {total_elapsed * 1000:.0f}ms | final_score={final}")

    return EvaluateResponse(
        similarity=sim_score,
        grammar=grammar_score,
        concept_coverage=concept_score,
        confidence=confidence,
        final_score=final,
        feedback=feedback_text
    )


if __name__ == "__main__":
    import uvicorn
    logger.info("🚀 Starting FastAPI server on http://0.0.0.0:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)