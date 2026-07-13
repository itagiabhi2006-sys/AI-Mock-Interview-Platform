package com.zsecurity.demo.entity;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TrackDto {
    private int orderId;
    private String Stage;
    private LocalDateTime updatedDate;

}
