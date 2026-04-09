package com.timelysync.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "linked_accounts")
public class LinkedAccount {
    @Id
    private String id;

    private String primaryUserId;

    private String linkedUserId;
    
    private String permission;
    
    public LinkedAccount() {}
    
    public LinkedAccount(User primaryUser, User linkedUser, String permission) {
        this.primaryUserId = primaryUser.getId();
        this.linkedUserId = linkedUser.getId();
        this.permission = permission;
    }
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getPrimaryUserId() { return primaryUserId; }
    public void setPrimaryUserId(String primaryUserId) { this.primaryUserId = primaryUserId; }
    
    public String getLinkedUserId() { return linkedUserId; }
    public void setLinkedUserId(String linkedUserId) { this.linkedUserId = linkedUserId; }
    
    public String getPermission() { return permission; }
    public void setPermission(String permission) { this.permission = permission; }
}
