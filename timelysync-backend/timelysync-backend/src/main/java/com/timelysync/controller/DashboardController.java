package com.timelysync.controller;

import com.timelysync.model.Achievement;
import com.timelysync.model.Task;
import com.timelysync.model.User;
import com.timelysync.payload.response.*;
import com.timelysync.security.UserDetailsImpl;
import com.timelysync.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    
    @Autowired
    private TaskService taskService;
    
    @Autowired
    private UserStatsService userStatsService;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private AccountService accountService;
    
    @GetMapping("/summary")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<DashboardSummaryDto> getDashboardSummary(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userDetails.getUser();
        List<Task> allTasks = taskService.getUserTasks(user);
        List<Task> activeTasks = allTasks.stream()
            .filter(t -> "ACTIVE".equals(t.getStatus()))
            .collect(Collectors.toList());
        List<Task> completedTasks = allTasks.stream()
            .filter(t -> "COMPLETED".equals(t.getStatus()))
            .collect(Collectors.toList());
        
        DashboardSummaryDto summary = new DashboardSummaryDto();
        summary.setTotalTasks(allTasks.size());
        summary.setActiveTasks(activeTasks.size());
        summary.setCompletedTasks(completedTasks.size());
        
        LocalDateTime now = LocalDateTime.now();
        long overdueCount = activeTasks.stream()
            .filter(t -> hasDueDate(t) && t.getDueDate().isBefore(now))
            .count();
        summary.setOverdueTasks((int) overdueCount);
        
        long highRiskCount = activeTasks.stream()
            .filter(t -> t.getRiskAnalysis() != null && t.getRiskAnalysis().contains("CRITICAL"))
            .count();
        summary.setHighRiskTasks((int) highRiskCount);
        
        double completionRate = allTasks.isEmpty() ? 0 : 
            (double) completedTasks.size() / allTasks.size() * 100;
        summary.setCompletionRate(Math.round(completionRate * 10) / 10.0);
        
        long onTimeCount = completedTasks.stream()
            .filter(this::completedOnTime)
            .count();
        double onTimeRate = completedTasks.isEmpty() ? 0 : 
            (double) onTimeCount / completedTasks.size() * 100;
        summary.setOnTimeRate(Math.round(onTimeRate * 10) / 10.0);
        
        double avgRiskScore = activeTasks.isEmpty() ? 0 : 
            activeTasks.stream()
                .mapToDouble(t -> extractRiskScore(t.getRiskAnalysis()))
                .average()
                .orElse(0);
        summary.setAvgRiskScore(Math.round(avgRiskScore * 10) / 10.0);
        
        List<Map<String, Object>> attentionTasksList = new ArrayList<>();
        for (Task task : activeTasks) {
            if (hasDueDate(task) && task.getDueDate().isBefore(now)) {
                Map<String, Object> taskMap = new HashMap<>();
                taskMap.put("id", task.getId());
                taskMap.put("title", task.getTitle());
                taskMap.put("dueDate", task.getDueDate());
                taskMap.put("reason", "Task is overdue");
                attentionTasksList.add(taskMap);
            } else if (task.getRiskAnalysis() != null && task.getRiskAnalysis().contains("CRITICAL")) {
                Map<String, Object> taskMap = new HashMap<>();
                taskMap.put("id", task.getId());
                taskMap.put("title", task.getTitle());
                taskMap.put("dueDate", task.getDueDate());
                taskMap.put("reason", "High risk of failure");
                attentionTasksList.add(taskMap);
            }
        }
        summary.setAttentionTasks(attentionTasksList.stream().limit(5).collect(Collectors.toList()));
        
        List<Map<String, Object>> weeklyTrend = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEE");
        for (int i = 6; i >= 0; i--) {
            LocalDateTime date = now.minusDays(i);
            LocalDateTime startOfDay = date.withHour(0).withMinute(0).withSecond(0);
            LocalDateTime endOfDay = startOfDay.plusDays(1);
            
            long completed = allTasks.stream()
                .filter(t -> "COMPLETED".equals(t.getStatus()) && 
                             t.getCompletedAt() != null &&
                             !t.getCompletedAt().isBefore(startOfDay) &&
                             t.getCompletedAt().isBefore(endOfDay))
                .count();
            
            long total = allTasks.stream()
                .filter(t -> hasDueDate(t) &&
                             !t.getDueDate().isBefore(startOfDay) &&
                             t.getDueDate().isBefore(endOfDay))
                .count();
            
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("day", date.format(formatter));
            dayData.put("date", date.toLocalDate().toString());
            dayData.put("completed", completed);
            dayData.put("total", total);
            weeklyTrend.add(dayData);
        }
        summary.setWeeklyTrend(weeklyTrend);
        
        Map<String, Object> cognitiveLoad = new HashMap<>();
        int activeCount = activeTasks.size();
        cognitiveLoad.put("activeTasksCount", activeCount);
        cognitiveLoad.put("isOverloaded", activeCount > 5);
        cognitiveLoad.put("maxCapacity", 5);
        if (activeCount > 5) {
            cognitiveLoad.put("warningMessage", "You have " + activeCount + " active tasks. Consider delegating or postponing some tasks to reduce cognitive load.");
        }
        summary.setCognitiveLoad(cognitiveLoad);
        
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getAnalytics(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(getDashboardSummary(userDetails).getBody());
    }

    @GetMapping("/today")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getTodaySnapshot(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<Task> todayTasks = taskService.getUserTasks(userDetails.getUser()).stream()
            .filter(task -> "ACTIVE".equals(task.getStatus()))
            .filter(task -> task.getDueDate() != null && task.getDueDate().toLocalDate().equals(LocalDateTime.now().toLocalDate()))
            .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("tasks", todayTasks);
        response.put("count", todayTasks.size());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/attention")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getAttentionTasks(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        DashboardSummaryDto summary = getDashboardSummary(userDetails).getBody();
        return ResponseEntity.ok(summary != null ? summary.getAttentionTasks() : List.of());
    }

    @GetMapping("/improvement")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getImprovementInsights() {
        Map<String, Object> response = new HashMap<>();
        response.put("insights", List.of(
            "Break high-effort tasks into smaller milestones",
            "Complete one overdue item before creating a new urgent task",
            "Use proof uploads to keep a clear completion history"));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/recent-activity")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getRecentActivity(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<Map<String, Object>> recentActivity = taskService.getUserTasks(userDetails.getUser()).stream()
            .sorted(Comparator.comparing(Task::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
            .limit(5)
            .map(task -> {
                Map<String, Object> item = new HashMap<>();
                item.put("taskId", task.getId());
                item.put("title", task.getTitle());
                item.put("status", task.getStatus());
                item.put("createdAt", task.getCreatedAt());
                return item;
            })
            .collect(Collectors.toList());

        return ResponseEntity.ok(recentActivity);
    }
    
    @GetMapping("/stats")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UserStatsDto> getUserStats(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        UserStatsDto stats = userStatsService.getUserStats(userDetails.getUser());
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/notifications")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<NotificationDto>> getNotifications(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<NotificationDto> notifications = notificationService.getUserNotifications(userDetails.getUser());
        return ResponseEntity.ok(notifications);
    }
    
    @GetMapping("/notifications/unread")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<NotificationDto>> getUnreadNotifications(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<NotificationDto> notifications = notificationService.getUnreadNotifications(userDetails.getUser());
        return ResponseEntity.ok(notifications);
    }
    
    @GetMapping("/notifications/unread/count")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long count = notificationService.getUnreadCount(userDetails.getUser());
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/notifications/{id}/read")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<MessageResponse> markNotificationRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(new MessageResponse("Notification marked as read"));
    }
    
    @PutMapping("/notifications/read-all")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<MessageResponse> markAllNotificationsRead(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        notificationService.markAllAsRead(userDetails.getUser());
        return ResponseEntity.ok(new MessageResponse("All notifications marked as read"));
    }
    
    @GetMapping("/accounts")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<AccountDto>> getLinkedAccounts(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<AccountDto> accounts = accountService.getLinkedAccounts(userDetails.getUser());
        return ResponseEntity.ok(accounts);
    }
    
    @PostMapping("/switch-account")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<MessageResponse> switchAccount(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                           @RequestBody Map<String, String> request) {
        String accountId = request.get("accountId");
        accountService.switchAccount(userDetails.getUser(), accountId);
        return ResponseEntity.ok(new MessageResponse("Account switched successfully"));
    }
    
    @PostMapping("/check-achievement")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> checkAchievement(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                              @RequestBody Map<String, String> request) {
        String type = request.get("type");
        String metadata = request.get("metadata");
        Achievement achievement = userStatsService.checkAndUnlockAchievement(
            userDetails.getUser(), 
            type, 
            metadata
        );
        if (achievement != null) {
            return ResponseEntity.ok(achievement);
        }
        return ResponseEntity.ok(new MessageResponse("No achievement unlocked"));
    }
    
    private int extractRiskScore(String riskAnalysis) {
        if (riskAnalysis == null) return 0;
        try {
            int scoreIndex = riskAnalysis.indexOf("riskScore");
            if (scoreIndex != -1) {
                String afterScore = riskAnalysis.substring(scoreIndex);
                int colonIndex = afterScore.indexOf(":");
                if (colonIndex != -1) {
                    String numberStr = afterScore.substring(colonIndex + 1).replaceAll("[^0-9]", "");
                    if (!numberStr.isEmpty()) {
                        return Integer.parseInt(numberStr);
                    }
                }
            }
        } catch (Exception e) {
            // Ignore parsing errors
        }
        return 0;
    }

    private boolean hasDueDate(Task task) {
        return task != null && task.getDueDate() != null;
    }

    private boolean completedOnTime(Task task) {
        return task != null
            && task.getCompletedAt() != null
            && task.getDueDate() != null
            && !task.getCompletedAt().isAfter(task.getDueDate());
    }
}
