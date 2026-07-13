package com.zsecurity.demo.services;

import com.zsecurity.demo.entity.Feedback;
import com.zsecurity.demo.entity.InterviewSession;
import com.zsecurity.demo.entity.Question;
import com.zsecurity.demo.entity.Users;
import com.zsecurity.demo.repositories.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AsyncEvaluationService {

    private final EvaluationService evaluationService;
    private final FeedbackRepository feedbackRepository;
    private final QuestionHistoryService historyService;

    /**
     * Runs the (slower) ML evaluation in the background, then updates the
     * already-saved Feedback row once scoring is done. The user is never
     * blocked waiting for this — submit() returns before this runs.
     */
    @Async
    public void evaluateAndUpdate(Long feedbackId, Users user, Question question,
                                  InterviewSession session, String userAnswer) {
        try {
            EvaluationService.EvaluationResponse eval = evaluationService.evaluate(
                    question.getText(),
                    question.getIdealAnswer() != null ? question.getIdealAnswer() : "",
                    userAnswer
            );

            Feedback feedback = feedbackRepository.findById(feedbackId)
                    .orElseThrow(() -> new RuntimeException("Feedback not found for async update: " + feedbackId));

            feedback.setScore(eval.getFinalScore());
            feedback.setSimilarityScore(eval.getSimilarityScore());
            feedback.setGrammarScore(eval.getGrammarScore());
            feedback.setConceptCoverage(eval.getConceptCoverage());
            feedback.setConfidenceScore(eval.getConfidenceScore());
            feedback.setAiComments(eval.getFeedback());
            feedback.setEvaluationStatus(Feedback.EvaluationStatus.COMPLETED);

            feedbackRepository.save(feedback);

            historyService.recordQuestionAsked(user, question, session, eval.getFinalScore());

        } catch (Exception e) {
            System.err.println("⚠️ Async evaluation failed for feedback " + feedbackId + ": " + e.getMessage());
            feedbackRepository.findById(feedbackId).ifPresent(f -> {
                f.setEvaluationStatus(Feedback.EvaluationStatus.FAILED);
                f.setAiComments("Evaluation failed — please contact support if this persists.");
                feedbackRepository.save(f);
            });
        }
    }
}