package com.zsecurity.demo.services;

import com.zsecurity.demo.entity.Users;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void emailGenerate(Users users){
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("itagiabhi2006@gmail.com");
            message.setTo(users.getEmail());
            message.setSubject("🎉 Welcome to Abhi's App!");
            message.setText(
                    "Hello " + users.getUsername() + ",\n\n" +
                            "We’re thrilled to have you join our community! 🚀\n" +
                            "Start exploring our features and make the most out of your journey with us.\n\n" +
                            "Warm regards,\n" +
                            "Abhi’s App Team"
            );
            mailSender.send(message);
        }catch (Exception e){
            throw new RuntimeException(e.getLocalizedMessage());
        }
    }

    public void emailToReset(Users users, String otp){
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("itagiabhi2006@gmail.com");
            message.setTo(users.getEmail());
            message.setSubject("🔑 Password Reset Request");
            message.setText(
                    "Hi " + users.getUsername() + ",\n\n" +
                            "We received a request to reset your password. \n" +
                            "Your One-Time Password (OTP) is: " + otp + "\n\n" +
                            "⚠️ This OTP will expire in 10 minutes.\n\n" +
                            "If you didn’t request this, please ignore this email.\n\n" +
                            "Regards,\n" +
                            "Abhi’s App Team"
            );
            mailSender.send(message);
        }catch (Exception e){
            throw new RuntimeException(e.getLocalizedMessage());
        }
    }

    public void resetSuccessfulMessage(String email){
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("itagiabhi2006@gmail.com");
            message.setTo(email);
            message.setSubject("✅ Password Reset Successful");
            message.setText(
                    "Hello,\n\n" +
                            "Your password has been successfully reset. You can now log in with your new password.\n\n" +
                            "If you didn’t perform this action, please contact our support team immediately.\n\n" +
                            "Best regards,\n" +
                            "Abhi’s App Security Team"
            );
            mailSender.send(message);
        }catch (Exception e){
            throw new RuntimeException(e.getLocalizedMessage());
        }
    }

    public void generateMailForCreatingOrder(String email){
    }
}
