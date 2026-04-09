package com.timelysync.service;

import com.timelysync.model.Task;
import com.timelysync.model.User;
import com.timelysync.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DashboardService {
    
    @Autowired
    private TaskRepository taskRepository;
    
    public long getActiveTaskCount(User user) {
        List<Task> tasks = taskRepository.findByUserIdAndStatus(user.getId(), "ACTIVE");
        return tasks.size();
    }
    
    public long getCompletedTaskCount(User user) {
        List<Task> tasks = taskRepository.findByUserIdAndStatus(user.getId(), "COMPLETED");
        return tasks.size();
    }
    
    public long getOverdueTaskCount(User user) {
        List<Task> overdueTasks = taskRepository.findByUserIdAndStatusAndDueDateLessThanEqual(user.getId(), "ACTIVE", LocalDateTime.now());
        return overdueTasks.size();
    }
    
    public double getCompletionRate(User user) {
        List<Task> allTasks = taskRepository.findByUserIdOrderByDueDateAsc(user.getId());
        if (allTasks.isEmpty()) return 0;
        
        long completed = allTasks.stream()
            .filter(t -> "COMPLETED".equals(t.getStatus()))
            .count();
        
        return (double) completed / allTasks.size() * 100;
    }
    
    public double getOnTimeRate(User user) {
        List<Task> completedTasks = taskRepository.findByUserIdAndStatus(user.getId(), "COMPLETED");
        if (completedTasks.isEmpty()) return 0;
        
        long onTime = completedTasks.stream()
            .filter(t -> t.getCompletedAt() != null && t.getCompletedAt().isBefore(t.getDueDate()))
            .count();
        
        return (double) onTime / completedTasks.size() * 100;
    }
}
