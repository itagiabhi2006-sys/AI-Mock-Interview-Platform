package com.zsecurity.demo.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "feedbacks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Feedback {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "question_id")
    private Question question;

    @ManyToOne
    @JoinColumn(name = "session_id")
    @JsonBackReference
    private InterviewSession session;

    @Column(length = 5000)
    private String answerTranscript;

    @Column(length = 5000)
    private String aiComments;

    private Double score;                // overall 0-100

    // New ML fields
    private Double similarityScore;
    private Double grammarScore;
    private Double conceptCoverage;
    private Double confidenceScore;

    private String mediaUrl;

    @Enumerated(EnumType.STRING)
    private EvaluationStatus evaluationStatus;

    public enum EvaluationStatus { PENDING, COMPLETED, FAILED }
}