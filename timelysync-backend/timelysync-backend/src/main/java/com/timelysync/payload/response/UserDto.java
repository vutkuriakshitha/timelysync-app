package com.timelysync.payload.response;

public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String name;
    private String avatar;
    private String accountType;
    private Integer streakDays;
    private Integer level;
    private Integer xpPoints;
    
    public UserDto(Long id, String username, String email, String name, String avatar, String accountType, Integer streakDays, Integer level, Integer xpPoints) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.name = name;
        this.avatar = avatar;
        this.accountType = accountType;
        this.streakDays = streakDays;
        this.level = level;
        this.xpPoints = xpPoints;
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    
    public String getAccountType() { return accountType; }
    public void setAccountType(String accountType) { this.accountType = accountType; }
    
    public Integer getStreakDays() { return streakDays; }
    public void setStreakDays(Integer streakDays) { this.streakDays = streakDays; }
    
    public Integer getLevel() { return level; }
    public void setLevel(Integer level) { this.level = level; }
    
    public Integer getXpPoints() { return xpPoints; }
    public void setXpPoints(Integer xpPoints) { this.xpPoints = xpPoints; }
}