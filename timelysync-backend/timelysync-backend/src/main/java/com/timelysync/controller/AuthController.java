package com.timelysync.controller;

import com.timelysync.model.User;
import com.timelysync.payload.request.LoginRequest;
import com.timelysync.payload.request.SignupRequest;
import com.timelysync.payload.response.JwtResponse;
import com.timelysync.payload.response.MessageResponse;
import com.timelysync.repository.UserRepository;
import com.timelysync.security.UserDetailsImpl;
import com.timelysync.security.jwt.JwtUtils;
import com.timelysync.service.EmailVerificationService;
import com.timelysync.service.PasswordResetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Pattern FRONTEND_EMAIL_PATTERN =
        Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    private static final Pattern FRONTEND_PASSWORD_PATTERN =
        Pattern.compile("^(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,128}$");
    
    @Autowired
    AuthenticationManager authenticationManager;
    
    @Autowired
    UserRepository userRepository;
    
    @Autowired
    PasswordEncoder encoder;
    
    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    EmailVerificationService emailVerificationService;

    @Autowired
    PasswordResetService passwordResetService;
    
    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        if (!Boolean.TRUE.equals(userDetails.getEmailVerified())) {
            SecurityContextHolder.clearContext();
            return ResponseEntity.status(403).body(new MessageResponse("Please verify your email before logging in"));
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        return ResponseEntity.ok(new JwtResponse(
            jwt,
            userDetails.getId(),
            userDetails.getUsername(),
            userDetails.getEmail(),
            userDetails.getName(),
            userDetails.getAvatar(),
            userDetails.getStreakDays(),
            userDetails.getLevel(),
            userDetails.getXpPoints(),
            userDetails.getAccountType()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginWithFrontendPayload(@RequestBody Map<String, String> request) {
        String email = normalizeEmail(request.get("email"));
        String password = request.get("password");

        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email and password are required"));
        }

        Optional<User> optionalUser = userRepository.findByEmailIgnoreCase(email);
        if (!optionalUser.isPresent()) {
            return ResponseEntity.status(401).body(new MessageResponse("Invalid email or password"));
        }

        User user = optionalUser.get();
        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            return ResponseEntity.status(403).body(new MessageResponse("Please verify your email before logging in"));
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), password));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("user", buildFrontendUser(userDetails));
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException exception) {
            return ResponseEntity.status(401).body(new MessageResponse("Invalid email or password"));
        }
    }
    
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        String normalizedEmail = normalizeEmail(signUpRequest.getEmail());

        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!"));
        }
        
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
        }
        
        User user = new User(
            signUpRequest.getUsername(),
            normalizedEmail,
            encoder.encode(signUpRequest.getPassword())
        );
        
        if (signUpRequest.getName() != null) {
            user.setName(signUpRequest.getName());
        }
        
        String verificationCode = emailVerificationService.prepareVerification(user);
        userRepository.save(user);
        emailVerificationService.sendVerificationEmail(user, verificationCode);

        return ResponseEntity.ok(new MessageResponse("User registered successfully. Verification code sent to email."));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerWithFrontendPayload(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String email = normalizeEmail(request.get("email"));
        String password = request.get("password");
        String phoneNumber = normalizeOptionalValue(request.get("phoneNumber"));

        if (name == null || name.isBlank() || email == null || email.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Required fields cannot be empty"));
        }

        if (!FRONTEND_EMAIL_PATTERN.matcher(email).matches()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Enter a valid email address"));
        }

        if (!FRONTEND_PASSWORD_PATTERN.matcher(password).matches()) {
            return ResponseEntity.badRequest().body(
                new MessageResponse("Password must be 8+ characters and include one uppercase letter, one number, and one special character")
            );
        }

        if (userRepository.existsByEmailIgnoreCase(email)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email is already in use!"));
        }

        String username = createUniqueUsername(name, email);
        User user = new User(username, email, encoder.encode(password));
        user.setName(name);
        user.setPhoneNumber(phoneNumber);
        String verificationCode = emailVerificationService.prepareVerification(user);
        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "User registered successfully. Verification code sent to email.");
        response.put("verificationRequired", true);
        response.put("email", user.getEmail());
        response.put("user", buildFrontendUser(UserDetailsImpl.build(user)));
        response.put("verificationCode", verificationCode);
        try {
            emailVerificationService.sendVerificationEmail(user, verificationCode);
            response.put("emailSent", true);
        } catch (MailException | IllegalStateException exception) {
            response.put("emailSent", false);
            response.put("verificationCode", verificationCode);
            response.put("message", "Email service is unavailable right now. Use the verification code shown below.");
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody Map<String, String> request) {
        String email = normalizeEmail(request.get("email"));
        String code = normalizeOptionalValue(request.get("code"));

        if (email == null || email.isBlank() || code == null || code.isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email and verification code are required"));
        }

        Optional<User> optionalUser = userRepository.findByEmailIgnoreCase(email);
        if (!optionalUser.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("No account found for this email"));
        }

        User user = optionalUser.get();
        if (!emailVerificationService.isCodeValid(user, code)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid or expired verification code"));
        }

        emailVerificationService.markVerified(user);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Email verified successfully"));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestBody Map<String, String> request) {
        String email = normalizeEmail(request.get("email"));

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email is required"));
        }

        Optional<User> optionalUser = userRepository.findByEmailIgnoreCase(email);
        if (!optionalUser.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("No account found for this email"));
        }

        User user = optionalUser.get();
        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            return ResponseEntity.ok(new MessageResponse("Email is already verified"));
        }

        String verificationCode = emailVerificationService.prepareVerification(user);
        userRepository.save(user);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Verification code sent again");
        response.put("email", user.getEmail());
        response.put("verificationCode", verificationCode);
        try {
            emailVerificationService.sendVerificationEmail(user, verificationCode);
            response.put("emailSent", true);
        } catch (MailException | IllegalStateException exception) {
            response.put("emailSent", false);
            response.put("verificationCode", verificationCode);
            response.put("message", "Email service is unavailable right now. Use the verification code shown below.");
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = normalizeEmail(request.get("email"));

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email is required"));
        }

        Optional<User> optionalUser = userRepository.findByEmailIgnoreCase(email);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            String resetCode = passwordResetService.prepareReset(user);
            userRepository.save(user);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "If an account exists for this email, a password reset code has been sent.");
            response.put("email", email);
            response.put("resetCode", resetCode);

            try {
                passwordResetService.sendPasswordResetEmail(user, resetCode);
                response.put("emailSent", true);
            } catch (MailException | IllegalStateException exception) {
                response.put("emailSent", false);
                response.put("resetCode", resetCode);
                response.put("message", "Email service is unavailable right now. Use the reset code shown below.");
            }

            return ResponseEntity.ok(response);
        }

        return ResponseEntity.ok(new MessageResponse("If an account exists for this email, a password reset code has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = normalizeEmail(request.get("email"));
        String code = normalizeOptionalValue(request.get("code"));
        String password = request.get("password");

        if (email == null || email.isBlank() || code == null || code.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email, reset code, and new password are required"));
        }

        if (!FRONTEND_PASSWORD_PATTERN.matcher(password).matches()) {
            return ResponseEntity.badRequest().body(
                new MessageResponse("Password must be 8+ characters and include one uppercase letter, one number, and one special character")
            );
        }

        Optional<User> optionalUser = userRepository.findByEmailIgnoreCase(email);
        if (!optionalUser.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid or expired reset code"));
        }

        User user = optionalUser.get();
        if (!passwordResetService.isCodeValid(user, code)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid or expired reset code"));
        }

        user.setPassword(encoder.encode(password));
        passwordResetService.clearReset(user);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Password reset successfully"));
    }

    private Map<String, Object> buildFrontendUser(UserDetailsImpl userDetails) {
        Map<String, Object> user = new HashMap<>();
        user.put("id", userDetails.getId());
        user.put("username", userDetails.getUsername());
        user.put("email", userDetails.getEmail());
        user.put("name", userDetails.getName());
        user.put("avatar", userDetails.getAvatar());
        user.put("phoneNumber", userDetails.getPhoneNumber());
        user.put("emailVerified", userDetails.getEmailVerified());
        user.put("streakDays", userDetails.getStreakDays());
        user.put("level", userDetails.getLevel());
        user.put("xpPoints", userDetails.getXpPoints());
        user.put("accountType", userDetails.getAccountType());
        return user;
    }

    private String createUniqueUsername(String name, String email) {
        String source = (name != null && !name.isBlank()) ? name : email;
        String base = source.toLowerCase().replaceAll("[^a-z0-9]+", "");
        if (base.isBlank()) {
            base = "user";
        }

        String candidate = base;
        int suffix = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = base + suffix;
            suffix++;
        }
        return candidate;
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private String normalizeOptionalValue(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
