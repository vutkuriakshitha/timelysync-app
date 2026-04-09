package com.timelysync.repository;

import com.timelysync.model.Task;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByUserIdOrderByDueDateAsc(String userId);
    List<Task> findByUserIdAndStatus(String userId, String status);
    List<Task> findByUserIdAndDueDateBetween(String userId, LocalDateTime start, LocalDateTime end);
    List<Task> findByUserIdAndDueDateBefore(String userId, LocalDateTime date);
    List<Task> findByUserIdAndDueDateAfter(String userId, LocalDateTime date);
    List<Task> findByUserIdAndStatusAndDueDateLessThanEqual(String userId, String status, LocalDateTime date);
}
