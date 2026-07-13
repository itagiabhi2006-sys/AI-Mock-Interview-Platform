package com.zsecurity.demo.dto;


import lombok.Data;

@Data
public class InterviewRequestDto {
    private String role; // target job role
    private int totalQuestions;
    private boolean includeAIGenerated ;
    private String difficultyLevel; // easy, medium, hard
    private String experienceLevel;

}

