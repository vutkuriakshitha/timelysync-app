package com.timelysync.payload.response;

public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String id;
    private String username;
    private String email;
    private String name;
    private String avatar;
    private Integer streakDays;
    private Integer level;
    private Integer xpPoints;
    private String accountType;
    
    public JwtResponse(String token, String id, String username, String email, String name, 
                       String avatar, Integer streakDays, Integer level, Integer xpPoints, String accountType) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.email = email;
        this.name = name;
        this.avatar = avatar;
        this.streakDays = streakDays;
        this.level = level;
        this.xpPoints = xpPoints;
        this.accountType = accountType;
    }
    
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    
    public Integer getStreakDays() { return streakDays; }
    public void setStreakDays(Integer streakDays) { this.streakDays = streakDays; }
    
    public Integer getLevel() { return level; }
    public void setLevel(Integer level) { this.level = level; }
    
    public Integer getXpPoints() { return xpPoints; }
    public void setXpPoints(Integer xpPoints) { this.xpPoints = xpPoints; }
    
    public String getAccountType() { return accountType; }
    public void setAccountType(String accountType) { this.accountType = accountType; }
}
