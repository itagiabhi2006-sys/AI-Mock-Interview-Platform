package com.zsecurity.demo.repositories;

import com.zsecurity.demo.entity.UserQuestionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserQuestionHistoryRepository extends JpaRepository<UserQuestionHistory, Long> {
    List<UserQuestionHistory> findByUserId(Long userId);
    List<UserQuestionHistory> findByUserIdAndQuestionId(Long userId, Long questionId);

    // Distinct questions viewed per domain, across ALL users -- this is what
    // drives "how much of this topic's pool has actually been consumed".
    @Query("SELECT q.domain, COUNT(DISTINCT h.question.id) " +
            "FROM UserQuestionHistory h JOIN h.question q " +
            "GROUP BY q.domain")
    List<Object[]> countDistinctViewedByDomain();


    // Count distinct viewed questions by domain and difficulty
    @Query("SELECT COUNT(DISTINCT q.id) FROM UserQuestionHistory h " +
            "JOIN h.question q " +
            "WHERE q.domain = :domain AND q.difficultyLevel = :difficulty")
    Long countDistinctViewedByDomainAndDifficulty(@Param("domain") String domain,
                                                  @Param("difficulty") String difficulty);
}