package com.timelysync.controller;

import com.timelysync.model.User;
import com.timelysync.payload.request.LoginRequest;
import com.timelysync.payload.response.MessageResponse;
import com.timelysync.repository.UserRepository;
import com.timelysync.security.UserDetailsImpl;
import com.timelysync.security.jwt.JwtUtils;
import com.timelysync.service.EmailVerificationService;
import com.timelysync.service.PasswordResetService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTests {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder encoder;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private EmailVerificationService emailVerificationService;

    @Mock
    private PasswordResetService passwordResetService;

    @InjectMocks
    private AuthController authController;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void authenticateUserRejectsUnverifiedUsersBeforeIssuingJwt() {
        User user = new User("student1", "student1@example.edu", "encoded-password");
        user.setId("user-1");
        user.setName("Student One");
        user.setEmailVerified(false);

        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        Authentication authentication = org.mockito.Mockito.mock(Authentication.class);
        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);

        LoginRequest request = new LoginRequest();
        request.setUsername("student1");
        request.setPassword("Password1!");

        ResponseEntity<?> response = authController.authenticateUser(request);

        assertEquals(403, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof MessageResponse);
        assertEquals("Please verify your email before logging in", ((MessageResponse) response.getBody()).getMessage());
        assertFalse(SecurityContextHolder.getContext().getAuthentication() != null);
        verify(jwtUtils, never()).generateJwtToken(any(Authentication.class));
    }

    @Test
    void registerWithFrontendPayloadAcceptsEduEmailAndStoresNormalizedEmail() {
        Map<String, String> request = new HashMap<>();
        request.put("name", "Student One");
        request.put("email", " Student.One@Example.EDU ");
        request.put("password", "Password1!");

        when(userRepository.existsByEmailIgnoreCase("student.one@example.edu")).thenReturn(false);
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(encoder.encode("Password1!")).thenReturn("encoded-password");
        when(emailVerificationService.prepareVerification(any(User.class))).thenReturn("123456");

        ResponseEntity<?> response = authController.registerWithFrontendPayload(request);

        assertEquals(200, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof Map);

        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertEquals(true, body.get("verificationRequired"));
        assertEquals("student.one@example.edu", body.get("email"));

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();

        assertNotNull(savedUser);
        assertEquals("student.one@example.edu", savedUser.getEmail());
        assertEquals("Student One", savedUser.getName());
        assertEquals("encoded-password", savedUser.getPassword());

        verify(emailVerificationService).sendVerificationEmail(savedUser, "123456");
    }

    @Test
    void forgotPasswordReturnsGenericSuccessAndDispatchesResetCodeForKnownUser() {
        Map<String, String> request = new HashMap<>();
        request.put("email", "student1@example.edu");

        User user = new User("student1", "student1@example.edu", "encoded-password");
        when(userRepository.findByEmailIgnoreCase("student1@example.edu")).thenReturn(java.util.Optional.of(user));
        when(passwordResetService.prepareReset(user)).thenReturn("654321");

        ResponseEntity<?> response = authController.forgotPassword(request);

        assertEquals(200, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof MessageResponse);
        assertEquals(
            "If an account exists for this email, a password reset code has been sent.",
            ((MessageResponse) response.getBody()).getMessage()
        );
        verify(userRepository).save(user);
        verify(passwordResetService).sendPasswordResetEmail(user, "654321");
    }

    @Test
    void resetPasswordUpdatesEncodedPasswordAndClearsResetState() {
        Map<String, String> request = new HashMap<>();
        request.put("email", "student1@example.edu");
        request.put("code", "123456");
        request.put("password", "NewPass1!");

        User user = new User("student1", "student1@example.edu", "old-password");
        when(userRepository.findByEmailIgnoreCase("student1@example.edu")).thenReturn(java.util.Optional.of(user));
        when(passwordResetService.isCodeValid(user, "123456")).thenReturn(true);
        when(encoder.encode("NewPass1!")).thenReturn("encoded-new-password");

        ResponseEntity<?> response = authController.resetPassword(request);

        assertEquals(200, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof MessageResponse);
        assertEquals("Password reset successfully", ((MessageResponse) response.getBody()).getMessage());
        assertEquals("encoded-new-password", user.getPassword());
        verify(passwordResetService).clearReset(user);
        verify(userRepository).save(user);
    }
}
