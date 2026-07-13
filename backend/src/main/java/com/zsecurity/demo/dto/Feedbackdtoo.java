package com.zsecurity.demo.dto;

import com.zsecurity.demo.entity.InterviewSession;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Feedbackdtoo {
    private Long id;
    private double averageScore;
    private String strengths;
    private String improvements;
    private String summary;
    private String role;
 //   private InterviewSession session;
}
