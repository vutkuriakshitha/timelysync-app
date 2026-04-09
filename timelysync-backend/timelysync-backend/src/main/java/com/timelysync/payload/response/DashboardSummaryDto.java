package com.timelysync.payload.response;

import java.util.List;
import java.util.Map;

public class DashboardSummaryDto {
    private Integer totalTasks;
    private Integer activeTasks;
    private Integer completedTasks;
    private Integer overdueTasks;
    private Integer highRiskTasks;
    private Double completionRate;
    private Double onTimeRate;
    private Double avgRiskScore;
    private List<Map<String, Object>> attentionTasks;
    private List<Map<String, Object>> weeklyTrend;
    private Map<String, Object> cognitiveLoad;
    
    public Integer getTotalTasks() { return totalTasks; }
    public void setTotalTasks(Integer totalTasks) { this.totalTasks = totalTasks; }
    
    public Integer getActiveTasks() { return activeTasks; }
    public void setActiveTasks(Integer activeTasks) { this.activeTasks = activeTasks; }
    
    public Integer getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(Integer completedTasks) { this.completedTasks = completedTasks; }
    
    public Integer getOverdueTasks() { return overdueTasks; }
    public void setOverdueTasks(Integer overdueTasks) { this.overdueTasks = overdueTasks; }
    
    public Integer getHighRiskTasks() { return highRiskTasks; }
    public void setHighRiskTasks(Integer highRiskTasks) { this.highRiskTasks = highRiskTasks; }
    
    public Double getCompletionRate() { return completionRate; }
    public void setCompletionRate(Double completionRate) { this.completionRate = completionRate; }
    
    public Double getOnTimeRate() { return onTimeRate; }
    public void setOnTimeRate(Double onTimeRate) { this.onTimeRate = onTimeRate; }
    
    public Double getAvgRiskScore() { return avgRiskScore; }
    public void setAvgRiskScore(Double avgRiskScore) { this.avgRiskScore = avgRiskScore; }
    
    public List<Map<String, Object>> getAttentionTasks() { return attentionTasks; }
    public void setAttentionTasks(List<Map<String, Object>> attentionTasks) { this.attentionTasks = attentionTasks; }
    
    public List<Map<String, Object>> getWeeklyTrend() { return weeklyTrend; }
    public void setWeeklyTrend(List<Map<String, Object>> weeklyTrend) { this.weeklyTrend = weeklyTrend; }
    
    public Map<String, Object> getCognitiveLoad() { return cognitiveLoad; }
    public void setCognitiveLoad(Map<String, Object> cognitiveLoad) { this.cognitiveLoad = cognitiveLoad; }
}