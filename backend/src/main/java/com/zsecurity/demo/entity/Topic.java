package com.zsecurity.demo.entity;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "topics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Topic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // This is the value stored in Question.domain — keep them consistent.
    @Column(nullable = false, unique = true)
    private String name;

    // Lets you disable a topic (stop generating for it) without deleting
    // its history/questions.
    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
