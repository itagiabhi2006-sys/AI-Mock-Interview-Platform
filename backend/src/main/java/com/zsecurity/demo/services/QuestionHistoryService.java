package com.zsecurity.demo.services;

import com.zsecurity.demo.entity.*;
import com.zsecurity.demo.repositories.UserQuestionHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionHistoryService {
    private final UserQuestionHistoryRepository historyRepository;

    public void recordQuestionAsked(Users user, Question question, InterviewSession session, Double score) {
        UserQuestionHistory history = UserQuestionHistory.builder()
                .user(user)
                .question(question)
                .session(session)
                .score(score)
                .build();
        historyRepository.save(history);
    }

    public List<UserQuestionHistory> getHistoryForUser(Long userId) {
        return historyRepository.findByUserId(userId);
    }
}