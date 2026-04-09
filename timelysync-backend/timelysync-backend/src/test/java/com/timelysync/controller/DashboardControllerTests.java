package com.timelysync.controller;

import com.timelysync.model.Task;
import com.timelysync.model.User;
import com.timelysync.payload.response.DashboardSummaryDto;
import com.timelysync.security.UserDetailsImpl;
import com.timelysync.service.AccountService;
import com.timelysync.service.NotificationService;
import com.timelysync.service.TaskService;
import com.timelysync.service.UserStatsService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardControllerTests {

    @Mock
    private TaskService taskService;

    @Mock
    private UserStatsService userStatsService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private AccountService accountService;

    @InjectMocks
    private DashboardController dashboardController;

    @Test
    void getDashboardSummaryHandlesTasksWithoutDueDates() {
        LocalDateTime now = LocalDateTime.now();

        User user = new User("student1", "student1@example.edu", "encoded-password");
        user.setId("user-1");
        user.setName("Student One");

        Task activeNoDueDate = buildTask("task-1", "Review circular", "ACTIVE", null, null,
            "{\"riskScore\":80,\"riskLevel\":\"CRITICAL\"}");
        Task overdueTask = buildTask("task-2", "Submit fee", "ACTIVE", now.minusDays(1), null, null);
        Task completedNoDueDate = buildTask("task-3", "Draft notes", "COMPLETED", null, now.minusHours(3), null);
        Task completedOnTime = buildTask("task-4", "Upload assignment", "COMPLETED",
            now.plusDays(1), now.minusHours(1), null);

        when(taskService.getUserTasks(any(User.class))).thenReturn(List.of(
            activeNoDueDate,
            overdueTask,
            completedNoDueDate,
            completedOnTime
        ));

        ResponseEntity<DashboardSummaryDto> response = dashboardController.getDashboardSummary(UserDetailsImpl.build(user));
        DashboardSummaryDto summary = response.getBody();

        assertNotNull(summary);
        assertEquals(4, summary.getTotalTasks());
        assertEquals(2, summary.getActiveTasks());
        assertEquals(2, summary.getCompletedTasks());
        assertEquals(1, summary.getOverdueTasks());
        assertEquals(1, summary.getHighRiskTasks());
        assertEquals(50.0, summary.getCompletionRate());
        assertEquals(50.0, summary.getOnTimeRate());
        assertEquals(40.0, summary.getAvgRiskScore());
        assertNotNull(summary.getAttentionTasks());
        assertEquals(2, summary.getAttentionTasks().size());
        assertNotNull(summary.getWeeklyTrend());
        assertEquals(7, summary.getWeeklyTrend().size());
        assertNotNull(summary.getCognitiveLoad());
        assertEquals(false, summary.getCognitiveLoad().get("isOverloaded"));
    }

    private Task buildTask(String id, String title, String status, LocalDateTime dueDate,
                           LocalDateTime completedAt, String riskAnalysis) {
        Task task = new Task();
        task.setId(id);
        task.setTitle(title);
        task.setUserId("user-1");
        task.setStatus(status);
        task.setDueDate(dueDate);
        task.setCompletedAt(completedAt);
        task.setRiskAnalysis(riskAnalysis);
        return task;
    }
}
