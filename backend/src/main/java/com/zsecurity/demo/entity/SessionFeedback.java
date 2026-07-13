package com.zsecurity.demo.entity;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "session_feedbacks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SessionFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double averageScore;

    @Column(length = 2000)
    private String strengths;

    @Column(length = 2000)
    private String improvements;

    @Column(length = 3000)
    private String summary;

    private String role;

    @OneToOne
    @JoinColumn(name = "session_id")
    private InterviewSession session;

    @Column(name = "media_url")
    private String mediaUrl;

}


