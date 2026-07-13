package com.zsecurity.demo.services;

import com.zsecurity.demo.entity.*;
import com.zsecurity.demo.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InterviewService {

    private final VideoRepo videoRepo;
    private final UserFeedBackRepo userFeedBackRepo;
    private final SessionFeedbackRepository sessionFeedbackRepository;
    private final InterviewSessionRepository sessionRepository;
    private final FeedbackRepository feedbackRepository;
    private final UserRepo userRepository;

    @Transactional
    public InterviewSession startSession(Long userId, String role, List<Question> questions) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        InterviewSession session = InterviewSession.builder()
                .user(user)
                .roleSearched(role)
                .startedAt(Instant.now())
                .build();
        return sessionRepository.save(session);
    }

    public InterviewSession getSessionById(Long sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
    }



    public Feedback saveFeedback(Feedback feedback) {
        return feedbackRepository.save(feedback);
    }

    public void saveSession(InterviewSession session) {
        sessionRepository.save(session);
    }

    public List<InterviewSession> getSessionsForUser(Long userId) {
        return sessionRepository.findByUserId(userId);
    }

    @Transactional
    public void attachMediaUrlToFeedback(Long sessionId, String videoUrl, String emotionDataJson, Long userId) {
        if (videoUrl == null) return;
        if (videoRepo.existsBySessionId(sessionId)) {
            System.out.println("Video already exists for session: " + sessionId);
            return;
        }
        Video video = Video.builder()
                .mediaUrl(videoUrl)
                .userId(userId)
                .sessionId(sessionId)
                .emotionData(emotionDataJson)
                .recordedAt(LocalDateTime.now())
                .build();
        videoRepo.save(video);
    }

    public void userFeedBack(UserFeedback userFeedback) {
        userFeedBackRepo.save(userFeedback);
    }
}