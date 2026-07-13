package com.zsecurity.demo.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GetAllUserOverview {
    private int totalUser;
    private int activeUser;
    private int dailySignup;
}
