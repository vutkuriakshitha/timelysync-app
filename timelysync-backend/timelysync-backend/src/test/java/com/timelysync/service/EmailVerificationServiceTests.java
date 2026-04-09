package com.timelysync.service;

import com.timelysync.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class EmailVerificationServiceTests {

    private final JavaMailSender mailSender = mock(JavaMailSender.class);
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final EmailVerificationService service = new EmailVerificationService(mailSender, passwordEncoder);

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(service, "fromEmail", "no-reply@timelysync.test");
    }

    @Test
    void prepareVerificationStoresHashedCodeAndValidatesRawCode() {
        User user = new User("student1", "student1@example.edu", "encoded-password");

        String rawCode = service.prepareVerification(user);

        assertNotNull(rawCode);
        assertNotNull(user.getEmailVerificationCode());
        assertNotEquals(rawCode, user.getEmailVerificationCode());
        assertTrue(service.isCodeValid(user, rawCode));
        assertFalse(service.isCodeValid(user, "000000"));
        assertNotNull(user.getEmailVerificationExpiry());
        assertTrue(user.getEmailVerificationExpiry().isAfter(java.time.LocalDateTime.now()));
    }

    @Test
    void sendVerificationEmailUsesReadableCode() {
        User user = new User("student2", "student2@example.edu", "encoded-password");

        service.sendVerificationEmail(user, "123456");

        verify(mailSender).send(any(SimpleMailMessage.class));
    }
}
