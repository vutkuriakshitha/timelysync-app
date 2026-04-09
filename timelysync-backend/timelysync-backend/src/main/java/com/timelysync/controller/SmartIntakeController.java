package com.timelysync.controller;

import com.timelysync.model.SmartIntakeRecord;
import com.timelysync.repository.SmartIntakeRecordRepository;
import com.timelysync.security.UserDetailsImpl;
import com.timelysync.service.AIExtractionService;
import com.timelysync.service.OCRService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/smart-intake")
public class SmartIntakeController {

    @Autowired
    private OCRService ocrService;

    @Autowired
    private AIExtractionService aiExtractionService;

    @Autowired
    private SmartIntakeRecordRepository smartIntakeRecordRepository;

    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> analyzeDocument(@RequestParam(value = "file", required = false) MultipartFile file,
                                             @RequestParam(value = "text", required = false) String text,
                                             @AuthenticationPrincipal UserDetailsImpl userDetails) {
        OCRService.ExtractedText extracted = ocrService.extract(file, text);
        Map<String, Object> taskDraft = aiExtractionService.analyzeText(extracted.getText(), extracted.getOriginalFileName());

        SmartIntakeRecord record = buildRecord(userDetails.getUser().getId(), extracted, taskDraft);
        smartIntakeRecordRepository.save(record);

        List<String> warnings = new ArrayList<>(extracted.getWarnings());
        warnings.addAll(asStringList(taskDraft.get("warnings")));

        Map<String, Object> response = new HashMap<>();
        response.put("recordId", record.getId());
        response.put("sourceType", record.getSourceType());
        response.put("fileName", record.getOriginalFileName());
        response.put("contentType", record.getContentType());
        response.put("extractedText", record.getExtractedText());
        response.put("warnings", warnings);
        response.put("task", taskDraft);
        response.put("message", "Smart Intake analyzed the document. Review the extracted task details before saving.");

        return ResponseEntity.ok(response);
    }

    private SmartIntakeRecord buildRecord(String userId,
                                          OCRService.ExtractedText extracted,
                                          Map<String, Object> taskDraft) {
        SmartIntakeRecord record = new SmartIntakeRecord();
        record.setUserId(userId);
        record.setOriginalFileName(extracted.getOriginalFileName());
        record.setContentType(extracted.getContentType());
        record.setSourceType(extracted.getSourceType());
        record.setExtractedText(extracted.getText());
        record.setTitle(asString(taskDraft.get("title")));
        record.setDescription(asString(taskDraft.get("description")));
        record.setCategory(asString(taskDraft.get("category")));
        record.setPriority(asString(taskDraft.get("priority")));
        record.setImpact(asString(taskDraft.get("impact")));
        record.setEffort(asString(taskDraft.get("effort")));
        record.setImpactSummary(asString(taskDraft.get("impactSummary")));
        record.setDueDate((LocalDateTime) taskDraft.get("dueDate"));
        record.setRules(asStringList(taskDraft.get("rules")));
        record.setRequiredDocuments(asStringList(taskDraft.get("requiredDocuments")));
        record.setTags(asStringList(taskDraft.get("tags")));
        record.setWarnings(asStringList(taskDraft.get("warnings")));
        record.setNotes(asString(taskDraft.get("notes")));
        Object confidence = taskDraft.get("confidence");
        if (confidence instanceof Number) {
            record.setConfidence(((Number) confidence).intValue());
        }
        record.setCreatedAt(LocalDateTime.now());
        return record;
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private List<String> asStringList(Object value) {
        if (!(value instanceof List<?>)) {
            return List.of();
        }
        List<?> list = (List<?>) value;
        return list.stream()
            .map(String::valueOf)
            .map(String::trim)
            .filter(StringUtils::hasText)
            .collect(Collectors.toList());
    }
}
