package com.timelysync.service;

import com.timelysync.model.User;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PasswordResetService {
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom random = new SecureRandom();

    @Value("${timelysync.mail.from:no-reply@timelysync.app}")
    private String fromEmail;

    public PasswordResetService(JavaMailSender mailSender, PasswordEncoder passwordEncoder) {
        this.mailSender = mailSender;
        this.passwordEncoder = passwordEncoder;
    }

    public String prepareReset(User user) {
        String rawCode = String.format("%06d", random.nextInt(1_000_000));
        user.setPasswordResetCode(passwordEncoder.encode(rawCode));
        user.setPasswordResetExpiry(LocalDateTime.now().plusMinutes(10));
        return rawCode;
    }

    public void sendPasswordResetEmail(User user, String rawCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(user.getEmail());
        message.setSubject("Reset your TimelySync password");
        message.setText(
            "Your TimelySync password reset code is " + rawCode
                + ". It will expire in 10 minutes."
        );
        mailSender.send(message);
    }

    public boolean isCodeValid(User user, String code) {
        String storedCode = user.getPasswordResetCode();
        boolean matches;
        try {
            matches = storedCode != null && passwordEncoder.matches(code, storedCode);
        } catch (IllegalArgumentException exception) {
            matches = storedCode != null && storedCode.equals(code);
        }

        return user.getPasswordResetCode() != null
            && user.getPasswordResetExpiry() != null
            && user.getPasswordResetExpiry().isAfter(LocalDateTime.now())
            && matches;
    }

    public void clearReset(User user) {
        user.setPasswordResetCode(null);
        user.setPasswordResetExpiry(null);
    }
}
