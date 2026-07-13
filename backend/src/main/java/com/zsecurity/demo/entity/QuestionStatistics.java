package com.zsecurity.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "question_statistics")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuestionStatistics {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "question_id")
    private Question question;

    private int totalAsked = 0;
    private Double avgScore;
    private LocalDateTime lastAsked;
}