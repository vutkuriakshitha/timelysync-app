package com.timelysync.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.timelysync.model.Task;
import com.timelysync.payload.response.MessageResponse;
import com.timelysync.security.UserDetailsImpl;
import com.timelysync.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getUserTasks(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<Task> tasks = taskService.getUserTasks(userDetails.getUser());
        Map<String, Object> response = new HashMap<>();
        response.put("tasks", tasks.stream().map(this::toTaskResponse).collect(Collectors.toList()));
        response.put("cognitiveLoad", taskService.getCognitiveLoad(userDetails.getUser()));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/predictions")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getFailurePredictions(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(taskService.getFailurePredictions(userDetails.getUser()));
    }

    @GetMapping("/cognitive-load")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getCognitiveLoad(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(taskService.getCognitiveLoad(userDetails.getUser()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getTaskById(@PathVariable String id, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Task task = taskService.getTaskById(id, userDetails.getUser());
        if (task == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Task not found"));
        }
        return ResponseEntity.ok(toTaskResponse(task));
    }

    @GetMapping("/{id}/impact")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getImpactSimulation(@PathVariable String id,
                                                 @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Task task = taskService.getTaskById(id, userDetails.getUser());
        if (task == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Task not found"));
        }
        return ResponseEntity.ok(taskService.getImpactSimulation(task));
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> createTask(@RequestBody Map<String, Object> payload,
                                        @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Task task = buildTaskFromPayload(new Task(), payload);
        Task createdTask = taskService.createTask(task, userDetails.getUser());
        return ResponseEntity.ok(toTaskResponse(createdTask));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> updateTask(@PathVariable String id,
                                        @RequestBody Map<String, Object> payload,
                                        @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Task task = buildTaskFromPayload(new Task(), payload);
        Task updatedTask = taskService.updateTask(id, task, userDetails.getUser());
        if (updatedTask == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Task not found"));
        }
        return ResponseEntity.ok(toTaskResponse(updatedTask));
    }

    @PutMapping("/{id}/subtasks/{subtaskId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> updateSubtask(@PathVariable String id,
                                           @PathVariable String subtaskId,
                                           @RequestBody Map<String, Object> payload,
                                           @AuthenticationPrincipal UserDetailsImpl userDetails) {
        boolean completed = Boolean.parseBoolean(String.valueOf(payload.get("completed")));
        Task updatedTask = taskService.updateSubtask(id, subtaskId, completed, userDetails.getUser());
        if (updatedTask == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Task not found"));
        }
        return ResponseEntity.ok(toTaskResponse(updatedTask));
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> completeTask(@PathVariable String id,
                                          @RequestParam(value = "proof", required = false) MultipartFile proof,
                                          @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Task completedTask = taskService.completeTask(id, proof, userDetails.getUser());
        if (completedTask == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Task not found"));
        }
        return ResponseEntity.ok(toTaskResponse(completedTask));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> deleteTask(@PathVariable String id, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        taskService.deleteTask(id, userDetails.getUser());
        return ResponseEntity.ok(new MessageResponse("Task deleted successfully"));
    }

    private Task buildTaskFromPayload(Task task, Map<String, Object> payload) {
        if (payload.containsKey("title")) task.setTitle(asString(payload.get("title")));
        if (payload.containsKey("description")) task.setDescription(asString(payload.get("description")));
        if (payload.containsKey("category")) task.setCategory(asString(payload.get("category")));
        if (payload.containsKey("priority")) task.setPriority(asString(payload.get("priority")));
        if (payload.containsKey("impact")) task.setImpact(asString(payload.get("impact")));
        if (payload.containsKey("effort")) task.setEffort(asString(payload.get("effort")));
        if (payload.containsKey("notes")) task.setNotes(asString(payload.get("notes")));
        if (payload.containsKey("status")) task.setStatus(asString(payload.get("status")));

        if (payload.containsKey("dueDate")) {
            task.setDueDate(parseDateTime(payload.get("dueDate")));
        }

        if (payload.containsKey("tags")) {
            Object tagsValue = payload.get("tags");
            if (tagsValue instanceof List) {
                task.setTags(String.join(",", ((List<?>) tagsValue).stream().map(String::valueOf).collect(Collectors.toList())));
            } else {
                task.setTags(asString(tagsValue));
            }
        }

        if (payload.containsKey("subtasks")) {
            try {
                task.setSubtasksJson(objectMapper.writeValueAsString(payload.get("subtasks")));
            } catch (Exception ignored) {
            }
        }

        return task;
    }

    private Map<String, Object> toTaskResponse(Task task) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", task.getId());
        response.put("title", task.getTitle());
        response.put("description", task.getDescription());
        response.put("category", task.getCategory());
        response.put("priority", task.getPriority());
        response.put("impact", task.getImpact());
        response.put("effort", task.getEffort());
        response.put("notes", task.getNotes());
        response.put("dueDate", task.getDueDate());
        response.put("status", task.getStatus());
        response.put("createdAt", task.getCreatedAt());
        response.put("completedAt", task.getCompletedAt());
        response.put("proofUrl", task.getProofUrl());
        response.put("proofFileName", extractProofFileName(task.getProofUrl()));
        response.put("tags", parseTags(task.getTags()));
        response.put("riskAnalysis", parseJsonMap(task.getRiskAnalysis()));
        response.put("subtasks", taskService.getSubtasks(task));
        response.put("impactSimulation", taskService.getImpactSimulation(task));
        response.put("postAnalysis", parseJsonMap(task.getPostAnalysisJson()));
        return response;
    }

    private Map<String, Object> parseJsonMap(String json) {
        if (json == null || json.isBlank()) {
            return new HashMap<>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception exception) {
            return new HashMap<>();
        }
    }

    private List<String> parseTags(String tags) {
        if (tags == null || tags.isBlank()) {
            return List.of();
        }
        return List.of(tags.split(",")).stream()
            .map(String::trim)
            .filter(value -> !value.isBlank())
            .collect(Collectors.toList());
    }

    private String extractProofFileName(String proofUrl) {
        if (proofUrl == null || proofUrl.isBlank()) {
            return null;
        }
        int index = proofUrl.lastIndexOf("/");
        return index >= 0 ? proofUrl.substring(index + 1) : proofUrl;
    }

    private LocalDateTime parseDateTime(Object value) {
        if (value == null) return null;
        String text = String.valueOf(value);
        if (text.isBlank()) return null;
        try {
            return LocalDateTime.parse(text);
        } catch (Exception ignored) {
            try {
                return LocalDateTime.parse(text, DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"));
            } catch (Exception ignoredAgain) {
                return null;
            }
        }
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
