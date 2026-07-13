package com.zsecurity.demo.controllers;

import com.zsecurity.demo.entity.GetAllUserOverview;
import com.zsecurity.demo.entity.Question;
import com.zsecurity.demo.entity.Users;
import com.zsecurity.demo.services.QuestionService;
import com.zsecurity.demo.services.Services;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {
    private final QuestionService questionService;
    private final Services services;

    @GetMapping("/questions")
    public List<Question> getAllQuestions() {
        return questionService.findAll();
    }

    @PostMapping("/questions")
    public Question createQuestion(@RequestBody Question question) {
        return questionService.save(question);
    }

    @DeleteMapping("/questions/{id}")
    public void deleteQuestion(@PathVariable Long id) {
        questionService.deleteById(id);
    }

    @GetMapping("/users")
    public List<Users> getAllUsers() {
        return services.getAllUSer();
    }

    @PutMapping("/users/{id}/deactivate")
    public void deactivateUser(@PathVariable long id) {
        services.deactivateUSer(id);
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable long id) {
        services.deleteUser(id);
    }

    @GetMapping("/analytics/overview")
    public GetAllUserOverview getOverview() {
        return services.getAllUserOverview();
    }
}