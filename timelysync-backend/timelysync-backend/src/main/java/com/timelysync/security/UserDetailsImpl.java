package com.timelysync.security;

import com.timelysync.model.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.Collections;
import java.util.Objects;

public class UserDetailsImpl implements UserDetails {
    private static final long serialVersionUID = 1L;
    
    private String id;
    private String username;
    private String email;
    @JsonIgnore
    private String password;
    private String name;
    private String avatar;
    private String phoneNumber;
    private Boolean emailVerified;
    private Integer streakDays;
    private Integer level;
    private Integer xpPoints;
    private String accountType;
    private String currentAccountId;
    private Integer totalTasksCompleted;
    private Integer onTimeCompletions;
    private java.time.LocalDateTime lastActivityDate;
    private String preferences;
    private Boolean darkMode;
    private Collection<? extends GrantedAuthority> authorities;
    
    public UserDetailsImpl(String id, String username, String email, String password, String name, 
                           String avatar, String phoneNumber, Boolean emailVerified, Integer streakDays, Integer level, Integer xpPoints, 
                           String accountType, String currentAccountId, Integer totalTasksCompleted,
                           Integer onTimeCompletions, java.time.LocalDateTime lastActivityDate,
                           String preferences, Boolean darkMode,
                           Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.name = name;
        this.avatar = avatar;
        this.phoneNumber = phoneNumber;
        this.emailVerified = emailVerified;
        this.streakDays = streakDays;
        this.level = level;
        this.xpPoints = xpPoints;
        this.accountType = accountType;
        this.currentAccountId = currentAccountId;
        this.totalTasksCompleted = totalTasksCompleted;
        this.onTimeCompletions = onTimeCompletions;
        this.lastActivityDate = lastActivityDate;
        this.preferences = preferences;
        this.darkMode = darkMode;
        this.authorities = authorities;
    }
    
    public static UserDetailsImpl build(User user) {
        return new UserDetailsImpl(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getPassword(),
            user.getName(),
            user.getAvatar(),
            user.getPhoneNumber(),
            user.getEmailVerified(),
            user.getStreakDays(),
            user.getLevel(),
            user.getXpPoints(),
            user.getAccountType(),
            user.getCurrentAccountId(),
            user.getTotalTasksCompleted(),
            user.getOnTimeCompletions(),
            user.getLastActivityDate(),
            user.getPreferences(),
            user.getDarkMode(),
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );
    }
    
    public User getUser() {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(password);
        user.setName(name);
        user.setAvatar(avatar);
        user.setPhoneNumber(phoneNumber);
        user.setEmailVerified(emailVerified);
        user.setStreakDays(streakDays);
        user.setLevel(level);
        user.setXpPoints(xpPoints);
        user.setAccountType(accountType);
        user.setCurrentAccountId(currentAccountId);
        user.setTotalTasksCompleted(totalTasksCompleted);
        user.setOnTimeCompletions(onTimeCompletions);
        user.setLastActivityDate(lastActivityDate);
        user.setPreferences(preferences);
        user.setDarkMode(darkMode);
        return user;
    }
    
    public String getId() {
        return id;
    }
    
    public String getEmail() {
        return email;
    }
    
    public String getName() {
        return name;
    }
    
    public String getAvatar() {
        return avatar;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public Boolean getEmailVerified() {
        return emailVerified;
    }
    
    public Integer getStreakDays() {
        return streakDays;
    }
    
    public Integer getLevel() {
        return level;
    }
    
    public Integer getXpPoints() {
        return xpPoints;
    }
    
    public String getAccountType() {
        return accountType;
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }
    
    @Override
    public String getPassword() {
        return password;
    }
    
    @Override
    public String getUsername() {
        return username;
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return true;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserDetailsImpl user = (UserDetailsImpl) o;
        return Objects.equals(id, user.id);
    }
}
