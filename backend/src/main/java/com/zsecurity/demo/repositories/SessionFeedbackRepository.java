package com.zsecurity.demo.repositories;

import com.zsecurity.demo.entity.SessionFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SessionFeedbackRepository extends JpaRepository<SessionFeedback, Long> {

    Optional<SessionFeedback> findBySession_Id(Long sessionId);

}