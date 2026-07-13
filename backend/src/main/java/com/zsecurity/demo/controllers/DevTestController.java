package com.zsecurity.demo.controllers;

import com.zsecurity.demo.services.QuestionScheduler;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dev")
@RequiredArgsConstructor
public class DevTestController {

    private final QuestionScheduler questionScheduler;

    @PostMapping("/trigger-question-generation")
    public ResponseEntity<String> trigger() {
        questionScheduler.generateQuestionsIfNeeded();
        return ResponseEntity.ok("Triggered. Check server logs.");
    }
}
