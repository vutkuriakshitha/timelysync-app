package com.timelysync.model;

import java.time.LocalDateTime;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User {
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String username;
    
    @Indexed(unique = true)
    private String email;
    
    private String password;

    private String phoneNumber;

    private Boolean emailVerified = false;

    private String emailVerificationCode;

    private LocalDateTime emailVerificationExpiry;

    private String passwordResetCode;

    private LocalDateTime passwordResetExpiry;
    
    private String name;
    
    private String avatar;
    
    private String accountType = "free";
    
    private String currentAccountId;
    
    private Integer streakDays = 0;
    
    private LocalDateTime lastActivityDate;
    
    private Integer xpPoints = 0;
    
    private Integer level = 1;
    
    private Integer totalTasksCompleted = 0;
    
    private Integer onTimeCompletions = 0;
    
    private String preferences;
    
    private Boolean darkMode = false;
    
    public User() {}
    
    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.name = username;
    }
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public Boolean getEmailVerified() { return emailVerified; }
    public void setEmailVerified(Boolean emailVerified) { this.emailVerified = emailVerified; }

    public String getEmailVerificationCode() { return emailVerificationCode; }
    public void setEmailVerificationCode(String emailVerificationCode) { this.emailVerificationCode = emailVerificationCode; }

    public LocalDateTime getEmailVerificationExpiry() { return emailVerificationExpiry; }
    public void setEmailVerificationExpiry(LocalDateTime emailVerificationExpiry) { this.emailVerificationExpiry = emailVerificationExpiry; }

    public String getPasswordResetCode() { return passwordResetCode; }
    public void setPasswordResetCode(String passwordResetCode) { this.passwordResetCode = passwordResetCode; }

    public LocalDateTime getPasswordResetExpiry() { return passwordResetExpiry; }
    public void setPasswordResetExpiry(LocalDateTime passwordResetExpiry) { this.passwordResetExpiry = passwordResetExpiry; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    
    public String getAccountType() { return accountType; }
    public void setAccountType(String accountType) { this.accountType = accountType; }
    
    public String getCurrentAccountId() { return currentAccountId; }
    public void setCurrentAccountId(String currentAccountId) { this.currentAccountId = currentAccountId; }
    
    public Integer getStreakDays() { return streakDays; }
    public void setStreakDays(Integer streakDays) { this.streakDays = streakDays; }
    
    public LocalDateTime getLastActivityDate() { return lastActivityDate; }
    public void setLastActivityDate(LocalDateTime lastActivityDate) { this.lastActivityDate = lastActivityDate; }
    
    public Integer getXpPoints() { return xpPoints; }
    public void setXpPoints(Integer xpPoints) { this.xpPoints = xpPoints; }
    
    public Integer getLevel() { return level; }
    public void setLevel(Integer level) { this.level = level; }
    
    public Integer getTotalTasksCompleted() { return totalTasksCompleted; }
    public void setTotalTasksCompleted(Integer totalTasksCompleted) { this.totalTasksCompleted = totalTasksCompleted; }
    
    public Integer getOnTimeCompletions() { return onTimeCompletions; }
    public void setOnTimeCompletions(Integer onTimeCompletions) { this.onTimeCompletions = onTimeCompletions; }
    
    public String getPreferences() { return preferences; }
    public void setPreferences(String preferences) { this.preferences = preferences; }
    
    public Boolean getDarkMode() { return darkMode; }
    public void setDarkMode(Boolean darkMode) { this.darkMode = darkMode; }
    
}
