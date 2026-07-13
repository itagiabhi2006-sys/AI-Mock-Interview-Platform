package com.zsecurity.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "interview_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InterviewSession {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Instant startedAt;
    private Instant finishedAt;

    @ManyToOne
    @JsonIgnore
    private Users user;


    private String roleSearched; // job role for which interview was generated

    private String metadata; // json or extra info (optional)

    // in InterviewSession
    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference                 // prevents back-ref recursion
    private List<Feedback> feedbacks = new ArrayList<>();

//    @OneToOne(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
//    @JsonIgnoreProperties({"session"})    // don't serialize session inside SessionFeedback
//    private SessionFeedback sessionFeedback;

    @OneToOne(mappedBy = "session")
    private SessionFeedback sessionFeedback;




}

