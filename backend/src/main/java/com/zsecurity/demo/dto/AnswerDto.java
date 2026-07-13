package com.zsecurity.demo.dto;

import lombok.Data;

@Data
public class AnswerDto {
    private Long questionId;
    private String answer; // text version of answer
    private String mediaUrl; // optional link to audio/video
}
