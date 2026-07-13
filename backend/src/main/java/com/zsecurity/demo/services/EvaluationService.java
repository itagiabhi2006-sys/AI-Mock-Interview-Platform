package com.zsecurity.demo.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
public class EvaluationService {
    private final WebClient webClient;

    @Value("${ml.service.url:http://localhost:8000}")
    private String mlServiceUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public EvaluationResponse evaluate(String questionText, String idealAnswer, String userAnswer) {
        EvaluationRequest request = new EvaluationRequest(questionText, idealAnswer, userAnswer);

        try {
            String responseJson = webClient.post()
                    .uri(mlServiceUrl + "/evaluate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(responseJson);
            return EvaluationResponse.builder()
                    .similarityScore(root.path("similarity").asDouble())
                    .grammarScore(root.path("grammar").asDouble())
                    .conceptCoverage(root.path("concept_coverage").asDouble())
                    .confidenceScore(root.path("confidence").asDouble())
                    .finalScore(root.path("final_score").asDouble())
                    .feedback(root.path("feedback").asText())
                    .build();

        } catch (Exception e) {
            return EvaluationResponse.builder()
                    .similarityScore(0.0)
                    .grammarScore(0.0)
                    .conceptCoverage(0.0)
                    .confidenceScore(0.0)
                    .finalScore(0.0)
                    .feedback("Evaluation service unavailable.")
                    .build();
        }
    }

    @Data
    public static class EvaluationRequest {
        private final String question;
        private final String idealAnswer;
        private final String userAnswer;
    }

    @Builder
    @Data
    public static class EvaluationResponse {
        private double similarityScore;
        private double grammarScore;
        private double conceptCoverage;
        private double confidenceScore;
        private double finalScore;
        private String feedback;
    }
}