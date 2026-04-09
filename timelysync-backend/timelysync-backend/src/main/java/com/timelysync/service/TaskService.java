package com.timelysync.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.timelysync.model.Task;
import com.timelysync.model.User;
import com.timelysync.repository.TaskRepository;
import com.timelysync.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.io.InputStream;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class TaskService {
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserStatsService userStatsService;
    
    @Autowired
    private NotificationService notificationService;
    
    private ObjectMapper objectMapper = new ObjectMapper();
    
    public List<Task> getUserTasks(User user) {
        return taskRepository.findByUserIdOrderByDueDateAsc(user.getId());
    }
    
    public Task getTaskById(String id, User user) {
        Task task = taskRepository.findById(id).orElse(null);
        if (task != null && user.getId().equals(task.getUserId())) {
            return task;
        }
        return null;
    }
    
    @Transactional
    public Task createTask(Task task, User user) {
        task.setUserId(user.getId());
        task.setCreatedAt(LocalDateTime.now());
        task.setStatus(task.getStatus() == null ? "ACTIVE" : task.getStatus());
        if (task.getPriority() == null) task.setPriority("MEDIUM");
        if (task.getImpact() == null) task.setImpact("MEDIUM");
        if (task.getEffort() == null) task.setEffort("MEDIUM");
        if (task.getSubtasksJson() == null || task.getSubtasksJson().isBlank()) {
            task.setSubtasksJson(toJson(generateDefaultSubtasks(task)));
        }
        task.setImpactSimulationJson(toJson(buildImpactSimulation(task)));
        
        analyzeTaskRisk(task);
        
        Task savedTask = taskRepository.save(task);
        
        notificationService.createNotification(user, "task", 
            "New task created: " + task.getTitle());
        
        return savedTask;
    }
    
    @Transactional
    public Task updateTask(String id, Task taskDetails, User user) {
        Task task = getTaskById(id, user);
        if (task == null) return null;
        
        if (taskDetails.getTitle() != null) task.setTitle(taskDetails.getTitle());
        if (taskDetails.getDescription() != null) task.setDescription(taskDetails.getDescription());
        if (taskDetails.getCategory() != null) task.setCategory(taskDetails.getCategory());
        if (taskDetails.getPriority() != null) task.setPriority(taskDetails.getPriority());
        if (taskDetails.getImpact() != null) task.setImpact(taskDetails.getImpact());
        if (taskDetails.getEffort() != null) task.setEffort(taskDetails.getEffort());
        if (taskDetails.getDueDate() != null) task.setDueDate(taskDetails.getDueDate());
        if (taskDetails.getTags() != null) task.setTags(taskDetails.getTags());
        if (taskDetails.getNotes() != null) task.setNotes(taskDetails.getNotes());
        if (taskDetails.getSubtasksJson() != null) task.setSubtasksJson(taskDetails.getSubtasksJson());
        if (taskDetails.getStatus() != null) task.setStatus(taskDetails.getStatus());
        
        task.setImpactSimulationJson(toJson(buildImpactSimulation(task)));
        analyzeTaskRisk(task);
        
        return taskRepository.save(task);
    }
    
    @Transactional
    public Task completeTask(String id, MultipartFile proof, User user) {
        Task task = getTaskById(id, user);
        if (task == null) return null;
        
        task.setStatus("COMPLETED");
        task.setCompletedAt(LocalDateTime.now());
        
        if (proof != null && !proof.isEmpty()) {
            String proofUrl = saveProofFile(proof, task.getId());
            task.setProofUrl(proofUrl);
        }
        task.setPostAnalysisJson(toJson(buildPostAnalysis(task)));
        
        Task savedTask = taskRepository.save(task);
        
        user.setTotalTasksCompleted(user.getTotalTasksCompleted() + 1);
        user.setLastActivityDate(LocalDateTime.now());
        
        if (savedTask.getDueDate() != null && !savedTask.getCompletedAt().isAfter(savedTask.getDueDate())) {
            user.setOnTimeCompletions(user.getOnTimeCompletions() + 1);
        }
        
        userRepository.save(user);
        
        int totalCompleted = user.getTotalTasksCompleted();
        if (totalCompleted == 1) {
            userStatsService.checkAndUnlockAchievement(user, "first_task", null);
        } else if (totalCompleted == 10) {
            userStatsService.checkAndUnlockAchievement(user, "task_complete_10", null);
        } else if (totalCompleted == 50) {
            userStatsService.checkAndUnlockAchievement(user, "task_complete_50", null);
        }
        
        int onTimeCount = user.getOnTimeCompletions();
        if (onTimeCount == 5) {
            userStatsService.checkAndUnlockAchievement(user, "on_time_5", null);
        } else if (onTimeCount == 20) {
            userStatsService.checkAndUnlockAchievement(user, "on_time_20", null);
        }
        
        if (task.getRiskAnalysis() != null && task.getRiskAnalysis().contains("\"riskLevel\":\"CRITICAL\"")) {
            userStatsService.checkAndUnlockAchievement(user, "high_risk_complete", null);
        }
        
        notificationService.createNotification(user, "task", 
            "🎉 Task completed: " + task.getTitle());
        
        return savedTask;
    }
    
    @Transactional
    public void deleteTask(String id, User user) {
        Task task = getTaskById(id, user);
        if (task != null) {
            taskRepository.delete(task);
            notificationService.createNotification(user, "task", 
                "Task deleted: " + task.getTitle());
        }
    }
    
    private void analyzeTaskRisk(Task task) {
        Map<String, Object> riskAnalysis = new HashMap<>();
        
        int riskScore = 0;
        String riskLevel = "SAFE";
        
        LocalDateTime now = LocalDateTime.now();
        long hoursUntilDue = task.getDueDate() == null ? 999 : Duration.between(now, task.getDueDate()).toHours();
        
        if (hoursUntilDue < 24) {
            riskScore += 40;
        } else if (hoursUntilDue < 72) {
            riskScore += 20;
        }
        
        if ("HIGH".equals(task.getPriority())) {
            riskScore += 30;
        } else if ("MEDIUM".equals(task.getPriority())) {
            riskScore += 15;
        }

        if ("HIGH".equals(task.getImpact())) {
            riskScore += 20;
        } else if ("MEDIUM".equals(task.getImpact())) {
            riskScore += 10;
        }

        if ("HIGH".equals(task.getEffort())) {
            riskScore += 20;
        } else if ("MEDIUM".equals(task.getEffort())) {
            riskScore += 10;
        }
        
        if (riskScore >= 70) {
            riskLevel = "CRITICAL";
        } else if (riskScore >= 40) {
            riskLevel = "WARNING";
        }
        
        riskAnalysis.put("riskScore", Math.min(riskScore, 100));
        riskAnalysis.put("riskLevel", riskLevel);
        riskAnalysis.put("reason", getFailureReason(task));
        riskAnalysis.put("factors", Map.of(
            "timePressure", hoursUntilDue < 24,
            "highPriority", "HIGH".equals(task.getPriority()),
            "highImpact", "HIGH".equals(task.getImpact()),
            "highEffort", "HIGH".equals(task.getEffort())
        ));
        
        try {
            task.setRiskAnalysis(objectMapper.writeValueAsString(riskAnalysis));
        } catch (Exception e) {
            task.setRiskAnalysis("{\"riskScore\":0,\"riskLevel\":\"SAFE\"}");
        }
    }

    public List<Map<String, Object>> getFailurePredictions(User user) {
        List<Map<String, Object>> predictions = new ArrayList<>();
        for (Task task : getUserTasks(user)) {
            if (!"ACTIVE".equals(task.getStatus())) {
                continue;
            }
            int probability = calculateFailureProbability(task);
            if (probability <= 35) {
                continue;
            }
            Map<String, Object> prediction = new HashMap<>();
            prediction.put("taskId", task.getId());
            prediction.put("title", task.getTitle());
            prediction.put("probability", probability);
            prediction.put("reason", getFailureReason(task));
            prediction.put("recommendedAction", getRecommendedAction(task));
            predictions.add(prediction);
        }
        predictions.sort((a, b) -> Integer.compare((Integer) b.get("probability"), (Integer) a.get("probability")));
        return predictions;
    }

    public Map<String, Object> getCognitiveLoad(User user) {
        List<Task> activeTasks = taskRepository.findByUserIdAndStatus(user.getId(), "ACTIVE");
        int activeCount = activeTasks.size();
        Map<String, Object> cognitiveLoad = new HashMap<>();
        cognitiveLoad.put("activeTasksCount", activeCount);
        cognitiveLoad.put("maxCapacity", 5);
        cognitiveLoad.put("isOverloaded", activeCount > 5);
        cognitiveLoad.put("warningMessage", activeCount > 5
            ? "You have " + activeCount + " active tasks. Consider postponing or completing one soon."
            : "Your current workload looks manageable.");
        return cognitiveLoad;
    }

    public Map<String, Object> getImpactSimulation(Task task) {
        Map<String, Object> simulation = fromJson(task.getImpactSimulationJson(), new TypeReference<Map<String, Object>>() {});
        return simulation.isEmpty() ? buildImpactSimulation(task) : simulation;
    }

    public Task updateSubtask(String taskId, String subtaskId, boolean completed, User user) {
        Task task = getTaskById(taskId, user);
        if (task == null) return null;

        List<Map<String, Object>> subtasks = getSubtasks(task);
        for (Map<String, Object> subtask : subtasks) {
            if (subtaskId.equals(String.valueOf(subtask.get("id")))) {
                subtask.put("completed", completed);
            }
        }
        task.setSubtasksJson(toJson(subtasks));
        return taskRepository.save(task);
    }

    public List<Map<String, Object>> getSubtasks(Task task) {
        List<Map<String, Object>> subtasks = fromJson(task.getSubtasksJson(), new TypeReference<List<Map<String, Object>>>() {});
        return subtasks.isEmpty() ? generateDefaultSubtasks(task) : subtasks;
    }

    private int calculateFailureProbability(Task task) {
        int probability = 0;
        long hoursUntilDue = task.getDueDate() == null ? 999 : ChronoUnit.HOURS.between(LocalDateTime.now(), task.getDueDate());

        if (hoursUntilDue < 12) {
            probability += 55;
        } else if (hoursUntilDue < 24) {
            probability += 40;
        } else if (hoursUntilDue < 72) {
            probability += 25;
        }

        if ("HIGH".equals(task.getPriority())) {
            probability += 20;
        } else if ("MEDIUM".equals(task.getPriority())) {
            probability += 10;
        }

        if ("HIGH".equals(task.getImpact())) {
            probability += 10;
        }
        if ("HIGH".equals(task.getEffort())) {
            probability += 10;
        }

        return Math.min(probability, 95);
    }

    private String getFailureReason(Task task) {
        if (task.getDueDate() == null) {
            return "Task is missing a clear deadline";
        }
        long hoursUntilDue = ChronoUnit.HOURS.between(LocalDateTime.now(), task.getDueDate());
        if (hoursUntilDue < 24) {
            return "Deadline is less than 24 hours away";
        }
        if ("HIGH".equals(task.getPriority()) && "HIGH".equals(task.getImpact())) {
            return "This is a high-priority, high-impact task";
        }
        if ("HIGH".equals(task.getEffort())) {
            return "Estimated effort is high for the time remaining";
        }
        return "This task needs steady progress to stay on track";
    }

    private String getRecommendedAction(Task task) {
        if (task.getDueDate() == null) {
            return "Set a clear due date and split the work into subtasks";
        }
        long hoursUntilDue = ChronoUnit.HOURS.between(LocalDateTime.now(), task.getDueDate());
        if (hoursUntilDue < 12) {
            return "Start immediately and focus on the highest-value part first";
        }
        if ("HIGH".equals(task.getEffort())) {
            return "Break it into subtasks and finish one milestone today";
        }
        return "Schedule a focused work block and review progress tonight";
    }

    private List<Map<String, Object>> generateDefaultSubtasks(Task task) {
        LocalDateTime dueDate = task.getDueDate() != null ? task.getDueDate() : LocalDateTime.now().plusDays(3);
        List<Map<String, Object>> subtasks = new ArrayList<>();
        subtasks.add(buildSubtask("sub-1", "Clarify the expected outcome", false, dueDate.minusDays(2)));
        subtasks.add(buildSubtask("sub-2", "Complete the main work", false, dueDate.minusDays(1)));
        subtasks.add(buildSubtask("sub-3", "Review and submit final version", false, dueDate));
        return subtasks;
    }

    private Map<String, Object> buildSubtask(String id, String title, boolean completed, LocalDateTime dueDate) {
        Map<String, Object> subtask = new HashMap<>();
        subtask.put("id", id);
        subtask.put("title", title);
        subtask.put("completed", completed);
        subtask.put("dueDate", dueDate);
        return subtask;
    }

    private Map<String, Object> buildImpactSimulation(Task task) {
        int probability = calculateFailureProbability(task);
        List<Map<String, Object>> consequences = new ArrayList<>();
        consequences.add(buildConsequence("Productivity drops for the next planned task", Math.min(95, probability)));
        consequences.add(buildConsequence("Stress increases near the deadline", Math.max(30, probability - 10)));
        consequences.add(buildConsequence("Completion streak may be affected", Math.max(20, probability - 20)));

        Map<String, Object> simulation = new HashMap<>();
        simulation.put("impactLevel", "HIGH".equals(task.getImpact()) ? "HIGH" : "MEDIUM");
        simulation.put("summary", "Missing this deadline could affect momentum, confidence, and nearby tasks.");
        simulation.put("consequences", consequences);
        simulation.put("recoveryPlan", buildRecoveryPlan(task, consequences));
        return simulation;
    }

    private Map<String, Object> buildRecoveryPlan(Task task, List<Map<String, Object>> consequences) {
        Map<String, Object> recoveryPlan = new HashMap<>();
        recoveryPlan.put("heading", "Recovery Plan");
        recoveryPlan.put("summary", buildRecoverySummary(task));
        recoveryPlan.put("steps", buildRecoverySteps(task, consequences));
        return recoveryPlan;
    }

    private String buildRecoverySummary(Task task) {
        long hoursLeft = getHoursLeft(task);
        if (hoursLeft >= 0 && hoursLeft <= 24) {
            return "This deadline is very close. A short focused recovery plan can still prevent the task from becoming a bigger problem.";
        }
        if ("HIGH".equalsIgnoreCase(task.getPriority()) || "HIGH".equalsIgnoreCase(task.getImpact())) {
            return "This is a high-priority, high-impact task, so recovery should protect it before lower-value work.";
        }
        return "Move the task forward with one concrete session so it does not create avoidable spillover into other commitments.";
    }

    private List<String> buildRecoverySteps(Task task, List<Map<String, Object>> consequences) {
        List<String> steps = new ArrayList<>();
        String title = task.getTitle() == null || task.getTitle().isBlank() ? "this task" : task.getTitle();
        String theme = inferRecoveryTheme(task);
        long hoursLeft = getHoursLeft(task);

        steps.add("Start with the first unfinished part of \"" + title + "\" instead of planning around it.");

        if ("payment".equals(theme)) {
            steps.add(buildUrgencyPrefix(hoursLeft) + " confirm the amount, payment route, and required proof so you can finish it in one pass.");
        } else if ("academic".equals(theme)) {
            steps.add(buildUrgencyPrefix(hoursLeft) + " complete the submission-critical portion first, then review formatting or supporting details.");
        } else if ("opportunity".equals(theme)) {
            steps.add(buildUrgencyPrefix(hoursLeft) + " finish the application essentials first: core form, required document, and final review.");
        } else if ("personal".equals(theme)) {
            steps.add(buildUrgencyPrefix(hoursLeft) + " remove friction by preparing the exact time, place, or material needed to start.");
        } else {
            steps.add(buildUrgencyPrefix(hoursLeft) + " break the work into 2 or 3 recovery steps and finish the first one before switching tasks.");
        }

        steps.add(buildConsequenceDrivenStep(task, consequences));
        return steps;
    }

    private String inferRecoveryTheme(Task task) {
        String source = String.join(" ",
            safeLower(task.getTitle()),
            safeLower(task.getDescription()),
            safeLower(task.getCategory()));

        if (source.matches(".*(fee|payment|loan|emi|installment|bill|invoice).*")) {
            return "payment";
        }
        if (source.matches(".*(exam|assignment|academic|class|semester|submission|project).*")) {
            return "academic";
        }
        if (source.matches(".*(apply|application|interview|opportunity|internship|job|career).*")) {
            return "opportunity";
        }
        if (source.matches(".*(gym|health|habit|workout|exercise|personal).*")) {
            return "personal";
        }
        return "general";
    }

    private String buildUrgencyPrefix(long hoursLeft) {
        if (hoursLeft >= 0 && hoursLeft <= 24) {
            return "Today,";
        }
        if (hoursLeft > 24 && hoursLeft <= 72) {
            return "In the next day,";
        }
        return "This week,";
    }

    private String buildConsequenceDrivenStep(Task task, List<Map<String, Object>> consequences) {
        String joined = consequences.stream()
            .map(item -> safeLower((String) item.get("description")))
            .reduce("", (left, right) -> left + " " + right);

        String baseStep;
        if (joined.contains("stress") || joined.contains("confidence")) {
            baseStep = "Reduce decision pressure by defining one exact next step and one finish point before you stop today.";
        } else if (joined.contains("productivity") || joined.contains("planned task") || joined.contains("momentum")) {
            baseStep = "Protect the rest of your schedule by finishing the blocking part first before starting any new task.";
        } else if (joined.contains("streak")) {
            baseStep = "Add a checkpoint reminder so you can recover progress before this task starts hurting your streak.";
        } else {
            baseStep = "Use one short checkpoint later today to confirm the task is moving and not slipping silently.";
        }

        if ("HIGH".equalsIgnoreCase(task.getPriority()) || "HIGH".equalsIgnoreCase(task.getImpact())) {
            return baseStep + " Treat it as a protected priority item until the riskiest part is cleared.";
        }
        return baseStep;
    }

    private long getHoursLeft(Task task) {
        if (task.getDueDate() == null) {
            return -1;
        }
        return Math.max(0, ChronoUnit.HOURS.between(LocalDateTime.now(), task.getDueDate()));
    }

    private String safeLower(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ENGLISH);
    }

    private Map<String, Object> buildConsequence(String description, int probabilityPercent) {
        Map<String, Object> consequence = new HashMap<>();
        consequence.put("description", description);
        consequence.put("probabilityPercent", probabilityPercent);
        return consequence;
    }

    private Map<String, Object> buildPostAnalysis(Task task) {
        Map<String, Object> analysis = new HashMap<>();
        analysis.put("summary", "Task completed successfully and recorded in TimelySync.");
        analysis.put("completedBeforeDeadline",
            task.getCompletedAt() != null && task.getDueDate() != null && !task.getCompletedAt().isAfter(task.getDueDate()));
        analysis.put("lessons", List.of(
            "Keep deadline-sensitive tasks visible on the dashboard",
            "Break large work into smaller checkpoints",
            "Upload proof right after completion when possible"));
        return analysis;
    }

    private <T> T fromJson(String json, TypeReference<T> typeReference) {
        if (json == null || json.isBlank()) {
            return emptyValue(typeReference);
        }
        try {
            return objectMapper.readValue(json, typeReference);
        } catch (Exception exception) {
            return emptyValue(typeReference);
        }
    }

    private <T> T emptyValue(TypeReference<T> typeReference) {
        String typeName = typeReference.getType().getTypeName();
        if (typeName.contains("List")) {
            return (T) new ArrayList<>();
        }
        if (typeName.contains("Map")) {
            return (T) new HashMap<>();
        }
        throw new IllegalStateException("Unable to create empty JSON value for type: " + typeName);
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception exception) {
            return null;
        }
    }
    
    private String saveProofFile(MultipartFile file, String taskId) {
        String originalName = file.getOriginalFilename() == null ? "proof" : file.getOriginalFilename();
        String sanitizedName = originalName.replaceAll("[^A-Za-z0-9._-]", "_");
        String storedFileName = "task_" + taskId + "_" + System.currentTimeMillis() + "_" + sanitizedName;
        Path uploadDirectory = Paths.get("uploads", "proofs");

        try {
            Files.createDirectories(uploadDirectory);
            Path targetPath = uploadDirectory.resolve(storedFileName).normalize();
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }
            return "/uploads/proofs/" + storedFileName;
        } catch (IOException exception) {
            throw new IllegalStateException("Could not store proof file", exception);
        }
    }
}
