package com.timelysync.repository;

import com.timelysync.model.SmartIntakeRecord;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SmartIntakeRecordRepository extends MongoRepository<SmartIntakeRecord, String> {
    List<SmartIntakeRecord> findByUserIdOrderByCreatedAtDesc(String userId);
}
