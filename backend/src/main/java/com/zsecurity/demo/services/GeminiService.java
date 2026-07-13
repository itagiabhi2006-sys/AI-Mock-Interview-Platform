package com.zsecurity.demo.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zsecurity.demo.entity.GeminiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.*;
import java.util.regex.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final WebClient client = WebClient.builder()
            .baseUrl("https://generativelanguage.googleapis.com/v1beta")
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("#{'${gemini.model.fallbacks:gemini-1.5-flash,gemini-1.5-pro}'.split(',')}")
    private List<String> modelFallbacks;

    /**
     * Structured question returned by the AI — matches Question entity fields.
     */
    public record GeneratedQuestion(
            String text,
            String topic,
            String subTopic,
            String idealAnswer,
            String keywords,
            String expectedConcepts
    ) {}

    private GeminiResponse callGemini(Map<String, Object> requestBody) {
        for (String model : modelFallbacks) {
            String uri = "/models/" + model + ":generateContent";
            int retries = 3;

            for (int attempt = 1; attempt <= retries; attempt++) {
                try {
                    Thread.sleep((long) (500 + Math.random() * 500));

                    GeminiResponse response = client.post()
                            .uri(uri + "?key=" + apiKey)
                            .bodyValue(requestBody)
                            .retrieve()
                            .bodyToMono(GeminiResponse.class)
                            .block();

                    if (response != null && response.getCandidates() != null && !response.getCandidates().isEmpty()) {
                        return response;
                    }

                } catch (WebClientResponseException.TooManyRequests e) {
                    long delay = attempt * 1000L;
                    System.err.println("⚠️ Gemini 429 Too Many Requests (" + model + ") → retrying in " + delay + "ms...");
                    try {
                        Thread.sleep(delay);
                    } catch (InterruptedException ignored) {
                        Thread.currentThread().interrupt();
                    }
                } catch (WebClientResponseException.NotFound e) {
                    System.err.println("⚠️ Model not found: " + model + " → trying next fallback...");
                    break;
                } catch (WebClientResponseException.BadRequest e) {
                    System.err.println("⚠️ Bad Request for model " + model + ": " + e.getResponseBodyAsString());
                    break;
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return null;
                } catch (Exception e) {
                    System.err.println("⚠️ Gemini API error (" + model + "): " + e.getMessage());
                }
            }
        }

        System.err.println("❌ Gemini call failed for all models.");
        return null;
    }

    public List<GeneratedQuestion> generateQuestions(String role, String experienceLevel, String difficultyLevel, int count) {
        return generateQuestions(role, experienceLevel, difficultyLevel, count, Collections.emptyList());
    }

    /**
     * Generate fully-structured interview questions — every field
     * (topic, subTopic, idealAnswer, keywords, expectedConcepts) is
     * guaranteed non-blank via Gemini's responseSchema enforcement.
     */
    public List<GeneratedQuestion> generateQuestions(String role, String experienceLevel,
                                                     String difficultyLevel, int count,
                                                     Collection<String> existingQuestions) {
        StringBuilder avoidBlock = new StringBuilder();
        if (existingQuestions != null && !existingQuestions.isEmpty()) {
            avoidBlock.append("Do NOT repeat or closely rephrase any of these already-used questions:\n");
            for (String q : existingQuestions) {
                avoidBlock.append("- ").append(q).append("\n");
            }
        }

        // Difficulty-specific guidance
        String difficultyGuidance = switch (difficultyLevel.toLowerCase()) {
            case "easy" -> """
                - Questions should test basic/fundamental knowledge
                - Ideal answers should be 2-3 sentences, straightforward
                - Focus on core concepts and common scenarios
                """;
            case "hard" -> """
                - Questions should test advanced/problem-solving skills
                - Ideal answers should be 4-6 sentences with depth
                - Include edge cases, optimization, or system design aspects
                """;
            default -> """
                - Questions should test practical knowledge
                - Ideal answers should be 3-4 sentences
                - Include real-world applications
                """;
        };

        int maxTokens = Math.max(4096, count * 600);

        String prompt = String.format("""
            Generate exactly %d technical interview questions for a %s role.
            - Experience level: %s
            - Difficulty level: %s
            %s
            %s

            For EVERY question, you MUST fill in all fields:
            - text: the question, ending with a question mark
            - topic: broad area
            - subTopic: narrower sub-area
            - idealAnswer: complete model answer (follow difficulty guidance)
            - keywords: 4-8 comma-separated tags
            - expectedConcepts: comma-separated concepts

            Return ONLY valid JSON array. No explanations.
            """, count, role, experienceLevel, difficultyLevel, difficultyGuidance, avoidBlock);

        // FIX: Use simpler schema with proper format
        Map<String, Object> responseSchema = Map.of(
                "type", "ARRAY",
                "items", Map.of(
                        "type", "OBJECT",
                        "properties", Map.of(
                                "text", Map.of("type", "STRING"),
                                "topic", Map.of("type", "STRING"),
                                "subTopic", Map.of("type", "STRING"),
                                "idealAnswer", Map.of("type", "STRING"),
                                "keywords", Map.of("type", "STRING"),
                                "expectedConcepts", Map.of("type", "STRING")
                        ),
                        "required", List.of("text", "topic", "subTopic", "idealAnswer", "keywords", "expectedConcepts")
                )
        );

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.7); // Lower temperature for more consistent output
        generationConfig.put("maxOutputTokens", maxTokens);
        generationConfig.put("responseMimeType", "application/json");
        generationConfig.put("responseSchema", responseSchema);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))));
        requestBody.put("generationConfig", generationConfig);

        GeminiResponse response = callGemini(requestBody);

        if (response == null || response.getCandidates() == null || response.getCandidates().isEmpty()) {
            System.err.println("⚠️ Gemini returned empty response while generating questions.");
            return Collections.emptyList();
        }

        String rawText = response.getCandidates().get(0).getContent().getParts().get(0).getText();

        // FIX: Better cleaning of the response
        String cleaned = rawText.trim();
        cleaned = cleaned.replaceAll("(?s)```json\\s*", "");
        cleaned = cleaned.replaceAll("(?s)```\\s*", "");
        cleaned = cleaned.trim();

        // FIX: Validate JSON completeness before parsing
        if (!isValidJson(cleaned)) {
            System.err.println("⚠️ Received incomplete JSON response. Attempting to repair...");
            cleaned = attemptRepairJson(cleaned);
            if (cleaned == null || !isValidJson(cleaned)) {
                System.err.println("⚠️ Could not repair JSON. Raw response:\n" + rawText);
                return Collections.emptyList();
            }
        }

        try {
            GeneratedQuestion[] parsed = objectMapper.readValue(cleaned, GeneratedQuestion[].class);

            List<GeneratedQuestion> questions = Arrays.stream(parsed)
                    .filter(this::isComplete)
                    .map(this::truncateToColumnLimits)
                    .collect(Collectors.toList());

            if (questions.size() < parsed.length) {
                System.err.println("⚠️ Dropped " + (parsed.length - questions.size()) + " incomplete questions.");
            }
            if (questions.size() < count) {
                System.err.println("⚠️ Gemini returned " + questions.size() + "/" + count + " complete questions.");
            }
            return questions;
        } catch (Exception e) {
            System.err.println("⚠️ Failed to parse structured questions JSON: " + e.getMessage()
                    + "\nRaw text:\n" + rawText);
            return Collections.emptyList();
        }
    }

    // FIX: Helper method to validate JSON
    private boolean isValidJson(String json) {
        if (json == null || json.trim().isEmpty()) {
            return false;
        }
        try {
            objectMapper.readTree(json);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // FIX: Attempt to repair truncated JSON
    private String attemptRepairJson(String json) {
        if (json == null) return null;

        json = json.trim();

        // If it's an array that's cut off, try to close it
        if (json.startsWith("[") && !json.endsWith("]")) {
            // Count opening and closing brackets
            int openCount = 0;
            int closeCount = 0;
            for (char c : json.toCharArray()) {
                if (c == '{') openCount++;
                else if (c == '}') closeCount++;
            }

            // Try to close the array properly
            if (openCount > closeCount) {
                // Add missing closing braces
                StringBuilder repaired = new StringBuilder(json);
                for (int i = 0; i < openCount - closeCount; i++) {
                    repaired.append("}");
                }
                repaired.append("]");
                return repaired.toString();
            }
        }

        return json;
    }

    private boolean isComplete(GeneratedQuestion q) {
        return notBlank(q.text()) && q.text().trim().endsWith("?")
                && notBlank(q.topic())
                && notBlank(q.subTopic())
                && notBlank(q.idealAnswer())
                && notBlank(q.keywords())
                && notBlank(q.expectedConcepts());
    }

    private boolean notBlank(String s) {
        return s != null && !s.trim().isEmpty();
    }

    // Safety net: never let a field exceed the DB column size
    private GeneratedQuestion truncateToColumnLimits(GeneratedQuestion q) {
        return new GeneratedQuestion(
                cap(q.text(), 2000),
                cap(q.topic(), 255),
                cap(q.subTopic(), 255),
                cap(q.idealAnswer(), 2000),
                cap(q.keywords(), 255),
                cap(q.expectedConcepts(), 2000)
        );
    }

    private String cap(String s, int max) {
        if (s == null) return null;
        s = s.trim();
        return s.length() <= max ? s : s.substring(0, max);
    }

    /**
     * Evaluate an answer: return comments + score (0-10)
     */
    public Map<String, Object> evaluateAnswer(String question, String transcript, String mediaUrl) {
        if (transcript == null || transcript.trim().isEmpty() ||
                transcript.equalsIgnoreCase("null") || transcript.equalsIgnoreCase("none")) {
            return Map.of("comments", "No valid answer provided.", "score", 0.0);
        }

        String prompt = String.format("""
                    You are a STRICT technical interview evaluator.
                    Evaluate the candidate's answer below and return ONLY JSON.

                    Question: %s
                    Candidate Answer: %s

                    Scoring (0-10):
                    0-2: Wrong or irrelevant
                    3-5: Partial or vague
                    6-7: Good, minor gaps
                    8-9: Excellent
                    10: Perfect

                    Return valid JSON like:
                    {"comments": "brief feedback", "score": 7.5}
                """, question, transcript);

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                "generationConfig", Map.of(
                        "temperature", 0.5,
                        "maxOutputTokens", 1024
                )
        );

        GeminiResponse response = callGemini(requestBody);

        if (response == null || response.getCandidates() == null || response.getCandidates().isEmpty()) {
            return Map.of("comments", "AI could not evaluate this answer (no response).", "score", 0.0);
        }

        String aiText = response.getCandidates().get(0).getContent().getParts().get(0).getText();
        aiText = aiText.trim().replaceAll("(?s)```json", "").replaceAll("(?s)```", "").trim();

        double score = 0.0;
        String comments = "";

        try {
            JsonNode node = objectMapper.readTree(aiText);
            comments = node.has("comments") ? node.get("comments").asText() : "";
            score = node.has("score") ? node.get("score").asDouble() : 0.0;
        } catch (Exception e) {
            System.err.println("⚠️ JSON parse failed: " + e.getMessage());
            Matcher cmt = Pattern.compile("\"comments\"\\s*:\\s*\"([^\"]+)\"").matcher(aiText);
            if (cmt.find()) comments = cmt.group(1);
            Matcher sc = Pattern.compile("\"score\"\\s*:\\s*(\\d+(?:\\.\\d+)?)").matcher(aiText);
            if (sc.find()) score = Double.parseDouble(sc.group(1));
        }

        if (score > 10.0) score /= 10.0;
        score = Math.max(0.0, Math.min(10.0, Math.round(score * 10.0) / 10.0));

        String lowerQ = question.toLowerCase(), lowerA = transcript.toLowerCase();
        if (lowerA.length() < 10 || isCircularAnswer(lowerQ, lowerA)) {
            score = Math.min(score, 2.0);
            comments = "Answer too brief or circular. " + comments;
        }

        if (comments.isBlank()) comments = aiText;
        return Map.of("comments", comments, "score", score);
    }

    private boolean isCircularAnswer(String question, String answer) {
        String[] qWords = question.replaceAll("[^a-z\\s]", "").split("\\s+");
        String[] aWords = answer.replaceAll("[^a-z\\s]", "").split("\\s+");
        if (aWords.length <= 3) {
            for (String q : qWords)
                for (String a : aWords)
                    if (q.length() > 3 && a.equals(q)) return true;
        }
        return false;
    }

    /**
     * Summarize entire interview session
     */
    public Map<String, String> summarizeSession(String allFeedback, String role) {
        String prompt = String.format("""
                Summarize candidate performance for the role %s.

                Provide JSON:
                {
                  "strengths": "positive traits or empty string",
                  "improvements": "single short line (100-150 chars)",
                  "summary": "brief overview"
                }

                Feedback:
                %s
                """, role, allFeedback);

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                "generationConfig", Map.of(
                        "temperature", 0.5,
                        "maxOutputTokens", 1024
                )
        );

        GeminiResponse response = callGemini(requestBody);

        if (response == null || response.getCandidates() == null || response.getCandidates().isEmpty()) {
            return Map.of("strengths", "", "improvements", "", "summary", "No summary generated.");
        }

        String aiText = response.getCandidates().get(0).getContent().getParts().get(0).getText()
                .replaceAll("(?s)```json", "")
                .replaceAll("(?s)```", "")
                .trim();

        try {
            JsonNode node = objectMapper.readTree(aiText);
            return Map.of(
                    "strengths", node.has("strengths") ? node.get("strengths").asText() : "",
                    "improvements", node.has("improvements") ? node.get("improvements").asText() : "",
                    "summary", node.has("summary") ? node.get("summary").asText() : ""
            );
        } catch (Exception e) {
            System.err.println("⚠️ JSON parsing error in summarizeSession: " + e.getMessage());
            return Map.of("strengths", "", "improvements", "", "summary", aiText);
        }
    }
}