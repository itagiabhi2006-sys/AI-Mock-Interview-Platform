package com.zsecurity.demo.dto;

import lombok.Data;

@Data
public class QuestionDto {
    private Long id;
    private String text;
    private String domain;
    private boolean aiGenerated;
    private String difficultyLevel; // easy, medium, hard
    private String experienceLevel;
}

