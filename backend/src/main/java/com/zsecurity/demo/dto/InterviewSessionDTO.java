package com.zsecurity.demo.dto;

import com.zsecurity.demo.entity.Feedback;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewSessionDTO {
    private Long id;
    private String role;
    private Instant startedAt;
    private Instant finishedAt;
    private double averageScore;
    private String strengths;
    private String improvements;
    private String feedbackSummary;
    private List<Feedback> feedbackList;

}
