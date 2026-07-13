package com.zsecurity.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "questions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Question {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 2000)
    private String text;

    @Column(length = 2000)
    private String idealAnswer;

    private String domain;               // job role
    private String topic;
    private String subTopic;
    private String difficultyLevel;

    @Column(length = 2000)
    private String expectedConcepts;

    private String keywords;             // comma separated

    private boolean aiGenerated = false;

    @Enumerated(EnumType.STRING)
    private QuestionStatus status = QuestionStatus.ACTIVE;

    private LocalDateTime createdAt = LocalDateTime.now();

    public enum QuestionStatus { ACTIVE, INACTIVE, ARCHIVED }
}