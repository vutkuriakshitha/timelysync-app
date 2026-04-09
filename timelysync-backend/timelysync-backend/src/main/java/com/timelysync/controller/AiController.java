package com.timelysync.controller;

import com.timelysync.model.Task;
import com.timelysync.security.UserDetailsImpl;
import com.timelysync.service.AIExtractionService;
import com.timelysync.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {
    
    @Autowired
    private TaskService taskService;

    @Autowired
    private AIExtractionService aiExtractionService;
    
    @GetMapping("/failure-predictions")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getFailurePredictions(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<Task> tasks = taskService.getUserTasks(userDetails.getUser());
        List<Map<String, Object>> predictions = new ArrayList<>();
        
        for (Task task : tasks) {
            if (!"ACTIVE".equals(task.getStatus())) continue;
            
            Map<String, Object> prediction = new HashMap<>();
            int probability = calculateFailureProbability(task);
            
            if (probability > 50) {
                prediction.put("taskId", task.getId());
                prediction.put("title", task.getTitle());
                prediction.put("probability", probability);
                prediction.put("reason", getFailureReason(task));
                prediction.put("recommendedAction", getRecommendedAction(task));
                predictions.add(prediction);
            }
        }
        
        predictions.sort((a, b) -> Integer.compare((int)b.get("probability"), (int)a.get("probability")));
        return ResponseEntity.ok(predictions);
    }

    @PostMapping("/classify-risk")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> classifyRisk(@RequestBody Map<String, Object> taskData) {
        int score = estimateRiskScore(taskData);
        String level = score >= 70 ? "CRITICAL" : score >= 40 ? "WARNING" : "SAFE";
        return ResponseEntity.ok(Map.of(
            "riskScore", score,
            "riskLevel", level
        ));
    }

    @PostMapping("/generate-subtasks")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> generateSubtasks(@RequestBody Map<String, Object> taskData) {
        String title = String.valueOf(taskData.getOrDefault("title", "Task"));
        return ResponseEntity.ok(List.of(
            Map.of("id", "sub-1", "title", "Clarify requirements for " + title, "completed", false),
            Map.of("id", "sub-2", "title", "Work on the main deliverable", "completed", false),
            Map.of("id", "sub-3", "title", "Review and finalize output", "completed", false)
        ));
    }

    @PostMapping("/predict-failure")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> predictFailure(@RequestBody Map<String, Object> taskData) {
        int probability = Math.min(95, estimateRiskScore(taskData) + 10);
        return ResponseEntity.ok(Map.of(
            "probability", probability,
            "reason", probability > 70 ? "High time pressure and task weight" : "Moderate deadline risk",
            "recommendedAction", probability > 70 ? "Start now and finish the most important part first" : "Schedule focused progress blocks"
        ));
    }

    @PostMapping("/simulate-impact")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> simulateImpactWithoutTask(@RequestBody Map<String, Object> taskData) {
        int score = estimateRiskScore(taskData);
        return ResponseEntity.ok(Map.of(
            "impactLevel", score >= 70 ? "HIGH" : "MEDIUM",
            "consequences", List.of(
                Map.of("description", "Productivity drops for connected tasks", "probabilityPercent", Math.min(95, score)),
                Map.of("description", "Stress rises closer to the deadline", "probabilityPercent", Math.max(30, score - 10))
            )
        ));
    }

    @PostMapping("/analyze-completion")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> analyzeCompletion(@RequestBody Map<String, Object> taskData) {
        return ResponseEntity.ok(Map.of(
            "summary", "Completion recorded successfully.",
            "lessons", List.of(
                "Keep proof of completion handy",
                "Break large tasks into smaller checkpoints",
                "Review progress before the final day"
            )
        ));
    }

    @PostMapping("/get-advice")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getAdvice(@RequestBody Map<String, Object> taskData) {
        int score = estimateRiskScore(taskData);
        return ResponseEntity.ok(Map.of(
            "riskAnalysis", Map.of(
                "riskScore", score,
                "riskLevel", score >= 70 ? "CRITICAL" : score >= 40 ? "WARNING" : "SAFE",
                "riskFactors", List.of("Deadline pressure", "Task complexity", "Priority weight")
            ),
            "failurePrediction", Map.of(
                "probability", Math.min(95, score + 10),
                "reason", score >= 70 ? "Task requires immediate attention" : "Task should be started soon",
                "recommendedAction", score >= 70 ? "Work on this today" : "Block time for it this week"
            ),
            "needsDecomposition", score >= 60
        ));
    }
    
    @PostMapping("/simulate-impact/{taskId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> simulateImpact(@PathVariable String taskId, 
                                            @RequestBody Map<String, String> scenario,
                                            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Task task = taskService.getTaskById(taskId, userDetails.getUser());
        if (task == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Task not found"));
        }
        
        Map<String, Object> impact = new HashMap<>();
        impact.put("taskId", taskId);
        impact.put("title", task.getTitle());
        
        String scenarioType = scenario.get("scenario");
        if ("miss".equals(scenarioType)) {
            impact.put("impact", "HIGH");
            impact.put("description", "Missing this deadline could affect your overall progress and streak");
            impact.put("consequences", Arrays.asList(
                "Streak reset to 0",
                "Risk score increase for related tasks",
                "Lower on-time completion rate",
                "-20 XP penalty"
            ));
            impact.put("recommendation", "Focus on completing this task immediately. Consider breaking it down into smaller steps.");
        } else if ("delay".equals(scenarioType)) {
            impact.put("impact", "MEDIUM");
            impact.put("description", "Delaying this task may cause a ripple effect on your schedule");
            impact.put("consequences", Arrays.asList(
                "Potential cascade delays",
                "Increased stress levels",
                "Reduced productivity score"
            ));
            impact.put("recommendation", "Re-prioritize your tasks. Use the Pomodoro technique for focused work.");
        } else {
            impact.put("impact", "LOW");
            impact.put("description", "Completing this task on time will maintain your momentum");
            impact.put("consequences", Arrays.asList(
                "+50 XP reward",
                "Maintain current streak",
                "Boost productivity score"
            ));
            impact.put("recommendation", "You're on track! Keep up the good work.");
        }

        impact.put("recoveryPlan", Map.of(
            "heading", "Recovery Plan",
            "summary", impact.get("recommendation"),
            "steps", "miss".equals(scenarioType)
                ? List.of(
                    "Start the highest-risk part of this task in your next focused session.",
                    "Break the remaining work into smaller checkpoints and finish the first one today.",
                    "Delay one lower-impact task if needed so this deadline stops creating spillover."
                )
                : "delay".equals(scenarioType)
                    ? List.of(
                        "Re-sequence your next work block so this task moves before other optional work.",
                        "Finish the blocking portion first, then review the rest after momentum is restored.",
                        "Add a follow-up checkpoint today so the delay does not keep expanding."
                    )
                    : List.of(
                        "Keep the current plan and protect the time already reserved for this task.",
                        "Finish the next smallest step early so the task stays comfortably on track.",
                        "Use a brief checkpoint later to confirm nothing important has slipped."
                    )
        ));
        
        return ResponseEntity.ok(impact);
    }
    
    @PostMapping("/smart-intake")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> smartTaskIntake(@RequestBody Map<String, String> input,
                                              @AuthenticationPrincipal UserDetailsImpl userDetails) {
        String text = input.get("text");
        if (text == null || text.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No input provided"));
        }

        Map<String, Object> parsedTask = aiExtractionService.analyzeText(text, input.get("source"));
        return ResponseEntity.ok(parsedTask);
    }
    
    private int calculateFailureProbability(Task task) {
        int probability = 0;
        LocalDateTime now = LocalDateTime.now();
        long hoursUntilDue = ChronoUnit.HOURS.between(now, task.getDueDate());
        
        if (hoursUntilDue < 24) {
            probability += 40;
        } else if (hoursUntilDue < 72) {
            probability += 20;
        }
        
        if ("HIGH".equals(task.getPriority())) {
            probability += 25;
        } else if ("MEDIUM".equals(task.getPriority())) {
            probability += 10;
        }
        
        return Math.min(probability, 95);
    }
    
    private String getFailureReason(Task task) {
        LocalDateTime now = LocalDateTime.now();
        long hoursUntilDue = ChronoUnit.HOURS.between(now, task.getDueDate());
        
        if (hoursUntilDue < 24) {
            return "Deadline is approaching within 24 hours";
        } else if ("HIGH".equals(task.getPriority())) {
            return "High priority task requires immediate attention";
        }
        return "Task shows signs of potential delay";
    }
    
    private String getRecommendedAction(Task task) {
        LocalDateTime now = LocalDateTime.now();
        long hoursUntilDue = ChronoUnit.HOURS.between(now, task.getDueDate());
        
        if (hoursUntilDue < 12) {
            return "Urgent: Complete immediately";
        } else if (hoursUntilDue < 24) {
            return "Complete today to avoid missing deadline";
        } else if ("HIGH".equals(task.getPriority())) {
            return "Prioritize this task in your next work session";
        }
        return "Break down into smaller sub-tasks for easier completion";
    }
    
    private int estimateRiskScore(Map<String, Object> taskData) {
        int score = 20;
        String priority = String.valueOf(taskData.getOrDefault("priority", "MEDIUM"));
        String impact = String.valueOf(taskData.getOrDefault("impact", "MEDIUM"));
        String effort = String.valueOf(taskData.getOrDefault("effort", "MEDIUM"));

        if ("HIGH".equals(priority)) score += 25;
        else if ("MEDIUM".equals(priority)) score += 10;

        if ("HIGH".equals(impact)) score += 20;
        else if ("MEDIUM".equals(impact)) score += 10;

        if ("HIGH".equals(effort)) score += 20;
        else if ("MEDIUM".equals(effort)) score += 10;

        Object dueDateValue = taskData.get("dueDate");
        if (dueDateValue != null) {
            try {
                LocalDateTime dueDate = LocalDateTime.parse(String.valueOf(dueDateValue));
                long hoursUntilDue = ChronoUnit.HOURS.between(LocalDateTime.now(), dueDate);
                if (hoursUntilDue < 24) score += 30;
                else if (hoursUntilDue < 72) score += 15;
            } catch (Exception ignored) {
            }
        }

        return Math.min(score, 100);
    }
}
