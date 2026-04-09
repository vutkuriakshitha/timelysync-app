package com.timelysync.service;

import com.timelysync.model.User;
import java.time.LocalDateTime;
import java.security.SecureRandom;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class EmailVerificationService {
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom random = new SecureRandom();

    @Value("${timelysync.mail.from:no-reply@timelysync.app}")
    private String fromEmail;

    public EmailVerificationService(JavaMailSender mailSender, PasswordEncoder passwordEncoder) {
        this.mailSender = mailSender;
        this.passwordEncoder = passwordEncoder;
    }

    public String generateCode() {
        return String.format("%06d", random.nextInt(1_000_000));
    }

    public String prepareVerification(User user) {
        String rawCode = generateCode();
        user.setEmailVerified(false);
        user.setEmailVerificationCode(passwordEncoder.encode(rawCode));
        user.setEmailVerificationExpiry(LocalDateTime.now().plusMinutes(10));
        return rawCode;
    }

    public void sendVerificationEmail(User user, String rawCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(user.getEmail());
        message.setSubject("Verify your TimelySync account");
        message.setText(
            "Your TimelySync verification code is " + rawCode
                + ". It will expire in 10 minutes."
        );
        mailSender.send(message);
    }

    public boolean isCodeValid(User user, String code) {
        String storedCode = user.getEmailVerificationCode();
        boolean matches;
        try {
            matches = storedCode != null && passwordEncoder.matches(code, storedCode);
        } catch (IllegalArgumentException exception) {
            matches = storedCode != null && storedCode.equals(code);
        }

        return user.getEmailVerificationCode() != null
            && user.getEmailVerificationExpiry() != null
            && user.getEmailVerificationExpiry().isAfter(LocalDateTime.now())
            && matches;
    }

    public void markVerified(User user) {
        user.setEmailVerified(true);
        user.setEmailVerificationCode(null);
        user.setEmailVerificationExpiry(null);
    }
}
