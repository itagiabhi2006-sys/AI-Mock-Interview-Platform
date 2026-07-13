package com.zsecurity.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Video {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long sessionId; // Link to the interview session

    private String mediaUrl; // Path or URL of the saved video

    @Lob
    private String emotionData;
    /*
        Stores the overall session-level emotion JSON, e.g.:
        {
            "averageEyeContact": 82.3,
            "averageConfidence": 91.5,
            "expressions": ["happy","thinking","neutral","confident"]
        }
    */

    private LocalDateTime recordedAt; // Timestamp when video was recorded

    private Long userId;
}
