package com.zsecurity.demo.services;

import com.zsecurity.demo.entity.Feedback;
import com.zsecurity.demo.entity.SessionFeedback;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SummaryService {

    private final GeminiService geminiService;

    public SessionFeedback generateSummary(List<Feedback> feedbacks, String role) {
        if (feedbacks == null || feedbacks.isEmpty()) {
            return SessionFeedback.builder()
                    .averageScore(0)
                    .strengths("No answers provided.")
                    .improvements("Please attempt the interview.")
                    .summary("Incomplete session.")
                    .role(role)
                    .build();
        }

        // Average score is always computed algorithmically — it's a plain
        // aggregation of stored per-answer scores, no reason to trust an LLM
        // with basic arithmetic or risk it hallucinating a number.
        double avg = feedbacks.stream().mapToDouble(Feedback::getScore).average().orElse(0);
        double roundedAvg = Math.round(avg * 10.0) / 10.0;

        // 1) Try Gemini first.
        Map<String, String> aiSummary = tryGenerateWithGemini(feedbacks, role);

        if (aiSummary != null) {
            return SessionFeedback.builder()
                    .averageScore(roundedAvg)
                    .strengths(aiSummary.get("strengths"))
                    .improvements(aiSummary.get("improvements"))
                    .summary(aiSummary.get("summary"))
                    .role(role)
                    .build();
        }

        // 2) Gemini failed or returned nothing usable — fall back to the
        // existing per-topic algorithmic summary.
        System.err.println("⚠️ Gemini summary unavailable — falling back to algorithmic summary.");
        return generateAlgorithmicSummary(feedbacks, role, roundedAvg);
    }

    /**
     * Attempts to get a summary from Gemini. Returns null if Gemini failed
     * outright or came back with nothing meaningful, so the caller can fall
     * back cleanly.
     */
    private Map<String, String> tryGenerateWithGemini(List<Feedback> feedbacks, String role) {
        try {
            String allFeedback = buildFeedbackBlock(feedbacks);
            Map<String, String> result = geminiService.summarizeSession(allFeedback, role);

            if (result == null) {
                return null;
            }

            String summary = result.getOrDefault("summary", "");
            // GeminiService itself returns this exact fallback string when
            // its own API call failed — treat that as "no real summary".
            boolean isGeminiFallbackText = "No summary generated.".equals(summary);

            if (summary.isBlank() || isGeminiFallbackText) {
                return null;
            }

            return result;
        } catch (Exception e) {
            System.err.println("⚠️ Error while generating Gemini session summary: " + e.getMessage());
            return null;
        }
    }

    private String buildFeedbackBlock(List<Feedback> feedbacks) {
        StringBuilder sb = new StringBuilder();
        int i = 1;
        for (Feedback fb : feedbacks) {
            String topic = (fb.getQuestion() != null && fb.getQuestion().getTopic() != null)
                    ? fb.getQuestion().getTopic() : "General";
            String questionText = fb.getQuestion() != null ? fb.getQuestion().getText() : "(unknown question)";

            sb.append(String.format(
                    "Q%d [%s]: %s%nAnswer: %s%nScore: %.1f/10%n%n",
                    i++, topic, questionText,
                    fb.getAnswerTranscript() != null ? fb.getAnswerTranscript() : "(no answer)",
                    fb.getScore()
            ));
        }
        return sb.toString();
    }

    private SessionFeedback generateAlgorithmicSummary(List<Feedback> feedbacks, String role, double roundedAvg) {
        Map<String, List<Double>> topicScores = new HashMap<>();
        for (Feedback fb : feedbacks) {
            String topic = fb.getQuestion().getTopic();
            if (topic == null) topic = "General";
            topicScores.computeIfAbsent(topic, k -> new ArrayList<>()).add(fb.getScore());
        }

        String strengths = topicScores.entrySet().stream()
                .sorted((e1, e2) -> Double.compare(
                        e2.getValue().stream().mapToDouble(Double::doubleValue).average().orElse(0),
                        e1.getValue().stream().mapToDouble(Double::doubleValue).average().orElse(0)))
                .limit(2)
                .map(e -> e.getKey() + " (" + Math.round(e.getValue().stream().mapToDouble(Double::doubleValue).average().orElse(0)) + "%)")
                .collect(Collectors.joining(", "));

        String improvements = topicScores.entrySet().stream()
                .sorted((e1, e2) -> Double.compare(
                        e1.getValue().stream().mapToDouble(Double::doubleValue).average().orElse(0),
                        e2.getValue().stream().mapToDouble(Double::doubleValue).average().orElse(0)))
                .limit(2)
                .map(e -> e.getKey() + " (" + Math.round(e.getValue().stream().mapToDouble(Double::doubleValue).average().orElse(0)) + "%)")
                .collect(Collectors.joining(", "));

        String summary = String.format("Overall performance: %.1f%%. Strong areas: %s. Areas for improvement: %s.",
                roundedAvg, strengths.isEmpty() ? "None" : strengths, improvements.isEmpty() ? "None" : improvements);

        return SessionFeedback.builder()
                .averageScore(roundedAvg)
                .strengths(strengths)
                .improvements(improvements)
                .summary(summary)
                .role(role)
                .build();
    }
}