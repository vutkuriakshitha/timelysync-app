package com.timelysync.model;

import java.time.LocalDateTime;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "tasks")
@CompoundIndexes({
    @CompoundIndex(name = "task_user_due_idx", def = "{'userId': 1, 'dueDate': 1}"),
    @CompoundIndex(name = "task_user_status_due_idx", def = "{'userId': 1, 'status': 1, 'dueDate': 1}")
})
public class Task {
    @Id
    private String id;
    
    private String title;
    
    private String description;
    
    @Indexed
    private String category;
    
    private String priority;

    private String impact;

    private String effort;
    
    @Indexed
    private LocalDateTime dueDate;
    
    @Indexed
    private String status;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime completedAt;
    
    private String tags;

    private String notes;
    
    private String proofUrl;

    @Indexed
    private String userId;

    private String riskAnalysis;

    private String subtasksJson;

    private String impactSimulationJson;

    private String postAnalysisJson;
    
    public Task() {}
    
    public Task(String title, String description, String category, String priority, LocalDateTime dueDate, User user) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.priority = priority;
        this.dueDate = dueDate;
        this.userId = user != null ? user.getId() : null;
        this.status = "ACTIVE";
        this.createdAt = LocalDateTime.now();
    }
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getImpact() { return impact; }
    public void setImpact(String impact) { this.impact = impact; }

    public String getEffort() { return effort; }
    public void setEffort(String effort) { this.effort = effort; }
    
    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public String getProofUrl() { return proofUrl; }
    public void setProofUrl(String proofUrl) { this.proofUrl = proofUrl; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getRiskAnalysis() { return riskAnalysis; }
    public void setRiskAnalysis(String riskAnalysis) { this.riskAnalysis = riskAnalysis; }

    public String getSubtasksJson() { return subtasksJson; }
    public void setSubtasksJson(String subtasksJson) { this.subtasksJson = subtasksJson; }

    public String getImpactSimulationJson() { return impactSimulationJson; }
    public void setImpactSimulationJson(String impactSimulationJson) { this.impactSimulationJson = impactSimulationJson; }

    public String getPostAnalysisJson() { return postAnalysisJson; }
    public void setPostAnalysisJson(String postAnalysisJson) { this.postAnalysisJson = postAnalysisJson; }
}
