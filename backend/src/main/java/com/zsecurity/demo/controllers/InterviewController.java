package com.zsecurity.demo.controllers;

import com.zsecurity.demo.dto.*;
import com.zsecurity.demo.entity.*;
import com.zsecurity.demo.repositories.FeedbackRepository;
import com.zsecurity.demo.repositories.SessionFeedbackRepository;
import com.zsecurity.demo.repositories.UserRepo;
import com.zsecurity.demo.repositories.VideoRepo;
import com.zsecurity.demo.services.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/interview")
@RequiredArgsConstructor
public class InterviewController {

    private final VideoRepo videoRepo;
    private final ImageServices imageServices;
    private final InterviewService interviewService;
    private final UserRepo userRepository;
    private final QuestionSelectionService selectionService;
    private final EvaluationService evaluationService;
    private final SummaryService summaryService;
    private final QuestionHistoryService historyService;
    private final QuestionService questionService;
    private final SessionFeedbackRepository sessionFeedbackRepository; // Added

    private final AsyncEvaluationService asyncEvaluationService;
    private final FeedbackRepository feedbackRepository;

    // 1️⃣ Start Interview
    @PostMapping("/start")
    public ResponseEntity<?> start(@RequestBody InterviewRequestDto request, Authentication auth) {
        String email = auth.getName();
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Question> questions = selectionService.selectQuestions(
                user,
                request.getRole(),
                request.getDifficultyLevel().toLowerCase(),
                request.getTotalQuestions()
        );

        if (questions.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No questions available for the given criteria."));
        }

        InterviewSession session = interviewService.startSession(user.getId(), request.getRole(), questions);

        Map<String, Object> response = new HashMap<>();
        response.put("sessionId", session.getId());
        response.put("questions", questions.stream().map(this::convertQuestionToDto).collect(Collectors.toList()));

        return ResponseEntity.ok(response);
    }

    // 2️⃣ Submit Answer
    @PostMapping("/submit/{sessionId}")
    public ResponseEntity<FeedbackDto> submit(
            @PathVariable Long sessionId,
            @RequestBody AnswerDto answer,
            Authentication auth
    ) {
        String email = auth.getName();
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        InterviewSession session = interviewService.getSessionById(sessionId);
        Question question = questionService.findById(answer.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        EvaluationService.EvaluationResponse eval = evaluationService.evaluate(
                question.getText(),
                question.getIdealAnswer() != null ? question.getIdealAnswer() : "",
                answer.getAnswer()
        );

        Feedback feedback = Feedback.builder()
                .question(question)
                .session(session)
                .answerTranscript(answer.getAnswer())
                .mediaUrl(answer.getMediaUrl())
                .score(eval.getFinalScore())
                .similarityScore(eval.getSimilarityScore())
                .grammarScore(eval.getGrammarScore())
                .conceptCoverage(eval.getConceptCoverage())
                .confidenceScore(eval.getConfidenceScore())
                .aiComments(eval.getFeedback())
                .build();

        interviewService.saveFeedback(feedback);
        historyService.recordQuestionAsked(user, question, session, eval.getFinalScore());

        FeedbackDto dto = FeedbackDto.builder()
                .questionId(question.getId())
                .questionText(question.getText())
                .aiComments(eval.getFeedback())
                .score(eval.getFinalScore())
                .answerTranscript(answer.getAnswer())
                .mediaUrl(answer.getMediaUrl())
                .build();

        return ResponseEntity.ok(dto);
    }

    // 3️⃣ Get History
    @GetMapping("/history")
    public ResponseEntity<List<InterviewSessionDTO>> history(Authentication auth) {
        String email = auth.getName();
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<InterviewSession> sessions = interviewService.getSessionsForUser(user.getId());
        List<InterviewSessionDTO> dtos = sessions.stream()
                .map(this::convertSessionToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }


@PostMapping("/finish/{sessionId}")
public ResponseEntity<?> finishInterview(@PathVariable Long sessionId) {
    try {
        Optional<SessionFeedback> existing = sessionFeedbackRepository.findBySession_Id(sessionId);
        if (existing.isPresent()) {
            return ResponseEntity.ok(Map.of(
                    "message", "Feedback already generated",
                    "feedback", convertSessionFeedbackToDto(existing.get())
            ));
        }

        InterviewSession session = interviewService.getSessionById(sessionId);
        if (session == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Session not found"));
        }
        if (session.getFeedbacks() == null || session.getFeedbacks().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No answers submitted."));
        }

        SessionFeedback feedback = summaryService.generateSummary(session.getFeedbacks(), session.getRoleSearched());
        feedback.setSession(session);
        SessionFeedback saved = sessionFeedbackRepository.save(feedback);

        return ResponseEntity.ok(Map.of(
                "message", "Interview completed successfully",
                "feedback", convertSessionFeedbackToDto(saved)
        ));

    } catch (org.springframework.dao.DataIntegrityViolationException dup) {
        // Lost the race to another concurrent request — just fetch what the winner saved.
        return sessionFeedbackRepository.findBySession_Id(sessionId)
                .map(f -> ResponseEntity.ok(Map.of(
                        "message", "Feedback already generated",
                        "feedback", convertSessionFeedbackToDto(f))))
                .orElse(ResponseEntity.internalServerError().body(Map.of("error", "Could not generate feedback")));
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}

    // 5️⃣ Video upload (unchanged)
    @PostMapping(value = "/video/{sessionId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public void uploadVideo(
            @PathVariable Long sessionId,
            @RequestPart(value = "videoFile", required = false) MultipartFile videoFile,
            @RequestParam("emotionData") String emotionDataJson,
            Authentication auth
    ) throws IOException {
        String email = auth.getName();
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (videoFile != null && !videoFile.isEmpty()) {
            String videoUrl = imageServices.uploadVideo(videoFile);
            interviewService.attachMediaUrlToFeedback(sessionId, videoUrl, emotionDataJson, user.getId());
        }
    }

    @GetMapping("/video")
    public ResponseEntity<?> getVideos(Authentication auth) {
        String email = auth.getName();
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(videoRepo.findByUserId(user.getId()));
    }

    @PostMapping("/user-feedback")
    public void userFeedBack(@RequestBody UserFeedback userFeedback) {
        interviewService.userFeedBack(userFeedback);
    }

    // ---------- Helpers ----------
    private QuestionDto convertQuestionToDto(Question q) {
        QuestionDto dto = new QuestionDto();
        dto.setId(q.getId());
        dto.setText(q.getText());
        dto.setDomain(q.getDomain());
        dto.setAiGenerated(q.isAiGenerated());
        dto.setDifficultyLevel(q.getDifficultyLevel());
        return dto;
    }

    private InterviewSessionDTO convertSessionToDto(InterviewSession session) {
        return InterviewSessionDTO.builder()
                .id(session.getId())
                .role(session.getRoleSearched())
                .startedAt(session.getStartedAt())
                .finishedAt(session.getFinishedAt())
                .averageScore(session.getSessionFeedback() != null ? session.getSessionFeedback().getAverageScore() : 0.0)
                .strengths(session.getSessionFeedback() != null ? session.getSessionFeedback().getStrengths() : "Not generated")
                .improvements(session.getSessionFeedback() != null ? session.getSessionFeedback().getImprovements() : "Not generated")
                .feedbackSummary(session.getSessionFeedback() != null ? session.getSessionFeedback().getSummary() : "Not generated")
                .feedbackList(session.getFeedbacks())
                .build();
    }

    private Feedbackdtoo convertSessionFeedbackToDto(SessionFeedback feedback) {
        Feedbackdtoo dto = new Feedbackdtoo();
        dto.setId(feedback.getId());
        dto.setAverageScore(feedback.getAverageScore());
        dto.setStrengths(feedback.getStrengths());
        dto.setImprovements(feedback.getImprovements());
        dto.setSummary(feedback.getSummary());
        dto.setRole(feedback.getRole());
        return dto;
    }
}