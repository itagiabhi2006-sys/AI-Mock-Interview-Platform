package com.zsecurity.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_question_history")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserQuestionHistory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private Users user;

    @ManyToOne
    @JoinColumn(name = "question_id")
    private Question question;

    @ManyToOne
    @JoinColumn(name = "session_id")
    private InterviewSession session;

    private Double score;
    private LocalDateTime askedDate = LocalDateTime.now();
}