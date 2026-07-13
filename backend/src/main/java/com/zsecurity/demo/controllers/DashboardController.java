// === File: com/zsecurity/demo/controllers/DashboardController.java ===
package com.zsecurity.demo.controllers;

import com.zsecurity.demo.entity.InterviewSession;
import com.zsecurity.demo.entity.SessionFeedback;
import com.zsecurity.demo.entity.Topic;
import com.zsecurity.demo.repositories.InterviewSessionRepository;
import com.zsecurity.demo.repositories.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final InterviewSessionRepository sessionRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<?> getDashboardData(@PathVariable Long userId) {
        List<InterviewSession> sessions = sessionRepository.findByUserIdOrderByStartedAtDesc(userId);

        if (sessions.isEmpty()) {
            return ResponseEntity.ok(Map.of("message", "No sessions yet"));
        }

        double overallAvg = sessions.stream()
                .filter(s -> s.getSessionFeedback() != null)
                .mapToDouble(s -> s.getSessionFeedback().getAverageScore())
                .average()
                .orElse(0);

        SessionFeedback latestFeedback = null;
        for (InterviewSession s : sessions) {
            if (s.getSessionFeedback() != null) {
                latestFeedback = s.getSessionFeedback();
                break;
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("overallAverage", Math.round(overallAvg * 10.0) / 10.0); // 1 decimal
        response.put("sessionCount", sessions.size());
        response.put("latestFeedback", latestFeedback);

        return ResponseEntity.ok(response);



    }

    private final TopicRepository topicRepository;

    @GetMapping("/options")
    List<Topic> getAllTopics(){
        return topicRepository.findByActiveTrue();
    }
}