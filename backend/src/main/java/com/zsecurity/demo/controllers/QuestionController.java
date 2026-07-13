// === File: com/zsecurity/demo/controllers/QuestionController.java ===
package com.zsecurity.demo.controllers;

import com.zsecurity.demo.dto.QuestionDto;
import com.zsecurity.demo.entity.Question;
import com.zsecurity.demo.services.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {
    private final QuestionService questionService;

    @PostMapping
    public ResponseEntity<QuestionDto> create(@RequestBody QuestionDto qdto) {
        Question q = Question.builder()
                .text(qdto.getText())
                .domain(qdto.getDomain())
                .aiGenerated(qdto.isAiGenerated())
                .difficultyLevel(qdto.getDifficultyLevel())
                .build();
        Question saved = questionService.save(q);
        qdto.setId(saved.getId());
        return ResponseEntity.ok(qdto);
    }

    @GetMapping("/domain/{domain}")
    public ResponseEntity<List<QuestionDto>> byDomain(@PathVariable String domain) {
        List<Question> list = questionService.getByDomain(domain);
        List<QuestionDto> dtos = list.stream().map(q -> {
            QuestionDto d = new QuestionDto();
            d.setId(q.getId());
            d.setText(q.getText());
            d.setDomain(q.getDomain());
            d.setAiGenerated(q.isAiGenerated());
            d.setDifficultyLevel(q.getDifficultyLevel());
            return d;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

//    @GetMapping("/generate")
//    public ResponseEntity<List<QuestionDto>> generate(@RequestParam String role, @RequestParam(defaultValue = "5") int total,
//                                                      @RequestParam(defaultValue = "true") boolean includeAi) {
//        List<Question> generated = questionService.generateMixed(role, total, includeAi);
//        List<QuestionDto> dtos = generated.stream().map(q -> {
//            QuestionDto d = new QuestionDto();
//            d.setId(q.getId());
//            d.setText(q.getText());
//            d.setDomain(q.getDomain());
//            d.setAiGenerated(q.isAiGenerated());
//            d.setDifficulty(q.getDifficultyLevel());
//            return d;
//        }).collect(Collectors.toList());
//        return ResponseEntity.ok(dtos);
//    }
}