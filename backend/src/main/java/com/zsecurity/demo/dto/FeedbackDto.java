package com.zsecurity.demo.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FeedbackDto {
    private Long feedbackId;
    private Long questionId;
    private String questionText;
    private String aiComments;
    private Double score;
    private String status;
    private String answerTranscript;
    private String mediaUrl;
}