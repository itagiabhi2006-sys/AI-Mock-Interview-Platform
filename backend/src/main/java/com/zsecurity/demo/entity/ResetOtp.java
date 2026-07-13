package com.zsecurity.demo.entity;

import jakarta.validation.constraints.Email;
import lombok.*;
import org.springframework.stereotype.Component;

@Component
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class ResetOtp {
    private String otp;
    private String newPassword;
    private String confirmPassword;
    private String email;
}
