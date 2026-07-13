package com.zsecurity.demo.services;

import com.zsecurity.demo.entity.Question;
import com.zsecurity.demo.entity.Topic;
import com.zsecurity.demo.repositories.QuestionRepository;
import com.zsecurity.demo.repositories.TopicRepository;
import com.zsecurity.demo.repositories.UserQuestionHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class QuestionScheduler {

    private final QuestionRepository questionRepository;
    private final UserQuestionHistoryRepository historyRepository;
    private final TopicRepository topicRepository;
    private final GeminiService geminiService;

    @Value("${questions.batch-size:25}")
    private int batchSize;

    @Value("${questions.max-batches-per-run:15}")
    private int maxBatchesPerRun;

    @Value("${questions.delay-between-batches-ms:8000}")
    private long delayBetweenBatchesMs;

    // A topic + difficulty needs at least this many questions before consumption % is meaningful
    @Value("${questions.min-pool-size:20}")
    private int minPoolSize;

    // Consumption-based generation tiers
    @Value("${questions.tier.high-threshold:80}")
    private double highThreshold;

    @Value("${questions.tier.high-generate:50}")
    private int highGenerateCount;

    @Value("${questions.tier.mid-threshold:60}")
    private double midThreshold;

    @Value("${questions.tier.mid-generate:20}")
    private int midGenerateCount;

    // Difficulty levels to check
    private static final List<String> DIFFICULTY_LEVELS = Arrays.asList("easy", "medium", "hard");

    @Scheduled(cron = "${questions.schedule.cron:0 0 2 * * *}")
    public void generateQuestionsIfNeeded() {
        System.out.println("Nightly adaptive question generation started");

        // --- Step 0: load active topics from the DB ---
        List<String> topics = topicRepository.findByActiveTrue().stream()
                .map(Topic::getName)
                .collect(Collectors.toList());

        if (topics.isEmpty()) {
            System.out.println("No active topics configured in DB. Skipping.");
            return;
        }

        // --- Step 1: For each topic and difficulty, calculate totals and views ---
        // Key format: topic|difficulty (e.g., "Java Developer|easy")
        Map<String, Long> totalByTopicDifficulty = new HashMap<>();
        Map<String, Long> viewedByTopicDifficulty = new HashMap<>();

        for (String topic : topics) {
            for (String difficulty : DIFFICULTY_LEVELS) {
                String key = topic + "|" + difficulty;

                // Count total questions for this topic + difficulty
                Long total = questionRepository.countByDomainAndDifficultyLevel(topic, difficulty);
                totalByTopicDifficulty.put(key, total);

                // Count distinct viewed questions for this topic + difficulty
                Long viewed = historyRepository.countDistinctViewedByDomainAndDifficulty(topic, difficulty);
                viewedByTopicDifficulty.put(key, viewed != null ? viewed : 0L);
            }
        }

        // --- Step 2: Decide how much to generate per topic + difficulty ---
        // Key format: topic|difficulty -> questions to generate
        LinkedHashMap<String, Integer> plan = new LinkedHashMap<>();

        for (String topic : topics) {
            for (String difficulty : DIFFICULTY_LEVELS) {
                String key = topic + "|" + difficulty;
                long total = totalByTopicDifficulty.getOrDefault(key, 0L);
                long viewed = viewedByTopicDifficulty.getOrDefault(key, 0L);

                // Low pool: generate to reach minimum
                if (total < minPoolSize) {
                    int need = (int) (minPoolSize - total);
                    plan.put(key, need);
                    System.out.printf("'%s' [%s]: total=%d below min pool size %d -> generate %d%n",
                            topic, difficulty, total, minPoolSize, need);
                    continue;
                }

                // Consumption-based generation
                double consumption = (viewed * 100.0) / total;
                int toGenerate = 0;

                if (consumption >= highThreshold) {
                    toGenerate = highGenerateCount;
                } else if (consumption >= midThreshold) {
                    toGenerate = midGenerateCount;
                }

                System.out.printf("'%s' [%s]: total=%d, viewed=%d, consumption=%.1f%% -> generate %d%n",
                        topic, difficulty, total, viewed, consumption, toGenerate);

                if (toGenerate > 0) {
                    plan.put(key, toGenerate);
                }
            }
        }

        if (plan.isEmpty()) {
            System.out.println("No topic/difficulty combination needs generation tonight. Skipping.");
            return;
        }

        // --- Step 3: Load existing questions for dedup ---
        Map<String, List<String>> existingTextsByTopicDifficulty = new HashMap<>();
        Set<String> existingExactAll = new HashSet<>();
        List<Set<String>> existingTokenSetsAll = new ArrayList<>();

        List<Question> allQuestions = questionRepository.findAll();
        for (Question q : allQuestions) {
            if (q.getDomain() != null && q.getDifficultyLevel() != null) {
                String key = q.getDomain() + "|" + q.getDifficultyLevel();
                existingTextsByTopicDifficulty.computeIfAbsent(key, k -> new ArrayList<>())
                        .add(q.getText());

                String norm = normalize(q.getText());
                existingExactAll.add(norm);
                existingTokenSetsAll.add(tokenize(norm));
            }
        }

        // --- Step 4: Execute the plan ---
        int totalSaved = 0;
        int batchesRun = 0;

        for (Map.Entry<String, Integer> entry : plan.entrySet()) {
            if (batchesRun >= maxBatchesPerRun) {
                System.out.println("Hit max batches per run — remaining plan deferred.");
                break;
            }

            String[] parts = entry.getKey().split("\\|");
            String topic = parts[0];
            String difficulty = parts[1];

            int remainingForEntry = entry.getValue();

            while (remainingForEntry > 0 && batchesRun < maxBatchesPerRun) {
                int thisBatch = Math.min(batchSize, remainingForEntry);

                // Get existing questions for this topic + difficulty
                String key = topic + "|" + difficulty;
                List<String> sampleExisting = existingTextsByTopicDifficulty
                        .getOrDefault(key, Collections.emptyList())
                        .stream()
                        .limit(30)
                        .collect(Collectors.toList());

                System.out.printf("Batch %d: requesting %d [%s] questions for '%s' (Difficulty: %s)%n",
                        batchesRun + 1, thisBatch, difficulty, topic, difficulty);

                // Call Gemini with specific difficulty
                List<GeminiService.GeneratedQuestion> generated = geminiService.generateQuestions(
                        topic,           // Role
                        "mid",           // Experience level
                        difficulty,      // Difficulty level (easy/medium/hard)
                        thisBatch,
                        sampleExisting
                );

                List<Question> toSave = new ArrayList<>();
                for (GeminiService.GeneratedQuestion gq : generated) {
                    String norm = normalize(gq.text());
                    if (norm.isEmpty() || existingExactAll.contains(norm)) {
                        continue;
                    }

                    Set<String> tokens = tokenize(norm);
                    if (isSimilarToAny(tokens, existingTokenSetsAll)) {
                        continue;
                    }

                    // Add to dedup sets
                    existingExactAll.add(norm);
                    existingTokenSetsAll.add(tokens);
                    existingTextsByTopicDifficulty.computeIfAbsent(key, k -> new ArrayList<>())
                            .add(gq.text().trim());

                    // Determine experience level based on difficulty
              //      String expLevel = mapDifficultyToExperience(difficulty);

                    toSave.add(Question.builder()
                            .text(gq.text().trim())
                            .createdAt(LocalDateTime.now())
                            .domain(topic)
                            .topic(gq.topic())
                            .subTopic(gq.subTopic())
                            .idealAnswer(gq.idealAnswer())
                            .keywords(gq.keywords())
                            .expectedConcepts(gq.expectedConcepts())
                            .difficultyLevel(difficulty)  // Use the actual difficulty
                            .aiGenerated(true)
                            .status(Question.QuestionStatus.ACTIVE)
                            .build());
                }

                if (!toSave.isEmpty()) {
                    questionRepository.saveAll(toSave);
                    totalSaved += toSave.size();
                }

                System.out.printf("Batch %d: saved %d new [%s] questions for '%s'%n",
                        batchesRun + 1, toSave.size(), difficulty, topic);

                remainingForEntry -= thisBatch;
                batchesRun++;

                if (batchesRun < maxBatchesPerRun) {
                    try {
                        Thread.sleep(delayBetweenBatchesMs);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        System.out.printf("Nightly generation finished early. Total saved: %d, batches: %d%n",
                                totalSaved, batchesRun);
                        return;
                    }
                }
            }
        }

        System.out.printf("Nightly generation finished. Total saved: %d, batches used: %d%n",
                totalSaved, batchesRun);
    }

    /**
     * Map difficulty to appropriate experience level
     */
//    private String mapDifficultyToExperience(String difficulty) {
//        switch (difficulty.toLowerCase()) {
//            case "easy":
//                return "junior";
//            case "medium":
//                return "mid";
//            case "hard":
//                return "senior";
//            default:
//                return "mid";
//        }
//    }

    // --- Deduplication helpers (same as before) ---
    private String normalize(String text) {
        if (text == null) return "";
        return text.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private Set<String> tokenize(String normalized) {
        return new HashSet<>(Arrays.asList(normalized.split(" ")));
    }

    private boolean isSimilarToAny(Set<String> tokens, List<Set<String>> existing) {
        if (tokens.isEmpty()) return false;
        for (Set<String> other : existing) {
            if (other.isEmpty()) continue;
            Set<String> intersection = new HashSet<>(tokens);
            intersection.retainAll(other);
            Set<String> union = new HashSet<>(tokens);
            union.addAll(other);
            double jaccard = (double) intersection.size() / union.size();
            if (jaccard >= 0.65) return true;
        }
        return false;
    }
}