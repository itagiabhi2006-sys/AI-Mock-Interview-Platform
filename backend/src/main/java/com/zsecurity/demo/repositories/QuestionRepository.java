package com.zsecurity.demo.repositories;


import com.zsecurity.demo.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByDomainAndDifficultyLevelAndStatus(
            String domain, String difficulty, Question.QuestionStatus status);

    List<Question> findByDomain(String domain);
    long countByDomain(String domain);

    // Count by domain and difficulty level
    Long countByDomainAndDifficultyLevel(String domain, String difficultyLevel);

    // Find by domain and difficulty level
    List<Question> findByDomainAndDifficultyLevel(String domain, String difficultyLevel);
}

