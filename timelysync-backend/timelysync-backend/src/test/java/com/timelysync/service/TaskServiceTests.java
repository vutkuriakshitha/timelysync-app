package com.timelysync.service;

import com.timelysync.model.Task;
import com.timelysync.model.User;
import com.timelysync.repository.TaskRepository;
import com.timelysync.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaskServiceTests {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserStatsService userStatsService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private TaskService taskService;

    @Test
    void completeTaskHandlesMissingDueDateWithoutThrowing() {
        User user = new User("student1", "student1@example.edu", "encoded-password");
        user.setId("user-1");
        user.setTotalTasksCompleted(0);
        user.setOnTimeCompletions(0);

        Task task = new Task();
        task.setId("task-1");
        task.setUserId("user-1");
        task.setTitle("Submit application");
        task.setStatus("ACTIVE");

        when(taskRepository.findById("task-1")).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Task completedTask = taskService.completeTask("task-1", null, user);

        assertNotNull(completedTask);
        assertEquals("COMPLETED", completedTask.getStatus());
        assertNotNull(completedTask.getCompletedAt());
        assertNull(completedTask.getDueDate());
        assertNotNull(completedTask.getPostAnalysisJson());
        assertEquals(1, user.getTotalTasksCompleted());
        assertEquals(0, user.getOnTimeCompletions());

        verify(userStatsService).checkAndUnlockAchievement(user, "first_task", null);
        verify(notificationService).createNotification(eq(user), eq("task"), contains("Task completed"));
    }

    @Test
    void completeTaskCountsFutureDeadlineAsOnTimeCompletion() {
        User user = new User("student2", "student2@example.edu", "encoded-password");
        user.setId("user-2");
        user.setTotalTasksCompleted(1);
        user.setOnTimeCompletions(4);

        Task task = new Task();
        task.setId("task-2");
        task.setUserId("user-2");
        task.setTitle("Upload assignment");
        task.setStatus("ACTIVE");
        task.setDueDate(LocalDateTime.now().plusMinutes(5));

        when(taskRepository.findById("task-2")).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Task completedTask = taskService.completeTask("task-2", null, user);

        assertNotNull(completedTask);
        assertEquals("COMPLETED", completedTask.getStatus());
        assertEquals(2, user.getTotalTasksCompleted());
        assertEquals(5, user.getOnTimeCompletions());

        verify(userStatsService).checkAndUnlockAchievement(user, "on_time_5", null);
    }
}
