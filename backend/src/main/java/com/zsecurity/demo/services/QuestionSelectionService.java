package com.zsecurity.demo.services;

import com.zsecurity.demo.entity.Question;
import com.zsecurity.demo.entity.Users;
import com.zsecurity.demo.repositories.QuestionRepository;
import com.zsecurity.demo.repositories.UserQuestionHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionSelectionService {
    private final QuestionRepository questionRepository;
    private final UserQuestionHistoryRepository historyRepository;

    public List<Question> selectQuestions(Users user, String role, String difficulty, int count) {
        List<Question> candidates = questionRepository.findByDomainAndDifficultyLevelAndStatus(
                role, difficulty, Question.QuestionStatus.ACTIVE);

        Set<Long> askedIds = historyRepository.findByUserId(user.getId())
                .stream()
                .map(h -> h.getQuestion().getId())
                .collect(Collectors.toSet());

        List<Question> available = candidates.stream()
                .filter(q -> !askedIds.contains(q.getId()))
                .collect(Collectors.toList());

        Collections.shuffle(available);
        if (available.size() < count) {
            return available; // return as many as possible
        }
        return available.subList(0, count);
    }
}