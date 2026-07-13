package com.zsecurity.demo.repositories;

import com.zsecurity.demo.entity.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {
    List<InterviewSession> findByUserIdOrderByStartedAtDesc(Long userId);
    List<InterviewSession> findByUserId(Long userId);
}
