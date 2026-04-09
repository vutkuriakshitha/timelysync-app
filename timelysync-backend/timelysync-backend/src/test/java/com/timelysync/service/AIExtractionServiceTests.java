package com.timelysync.service;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AIExtractionServiceTests {

    private final AIExtractionService service = new AIExtractionService();

    @Test
    void extractsAcademicDeadlineFromExamFeeCircular() {
        String sampleText = String.join("\n",
            "ABC INSTITUTE OF TECHNOLOGY",
            "(Autonomous Institution, Affiliated to JNTUH)",
            "Ghatkesar, Hyderabad - 501301",
            "Office of the Controller of Examinations",
            "Circular No: AIT/EXAM/2036/041",
            "Date: 29 March 2036",
            "Subject: Payment of Examination Fee with Late Fee - Reg.",
            "All the students of B.Tech, M.Tech, and MBA are hereby informed that the last date for",
            "payment of semester examination fee with late fee is 08 April 2036. Students who have not paid",
            "the examination fee within the regular deadline are required to pay the fee along with a late fee",
            "of Rs 500 on or before the mentioned date through the college online examination portal.",
            "Students who fail to pay the examination fee with late fee before the deadline will not be",
            "permitted to appear for the semester examinations and their hall tickets will not be generated",
            "under any circumstances. All Heads of Departments are requested to inform the students and",
            "ensure timely payment."
        );

        Map<String, Object> result = service.analyzeText(sampleText, "exam-fee-circular.pdf");

        assertEquals("ACADEMIC", result.get("category"));
        assertEquals("HIGH", result.get("priority"));
        assertEquals("HIGH", result.get("impact"));
        assertEquals(LocalDateTime.of(2036, 4, 8, 18, 0), result.get("dueDate"));
        assertEquals("Payment of Examination Fee with Late Fee", result.get("title"));
        assertEquals("Pay the semester examination fee with late fee of Rs 500 through the college online examination portal.",
            result.get("actionSummary"));
        assertEquals("If missed, you cannot appear for the semester examinations and hall tickets will not be generated.",
            result.get("impactSummary"));

        @SuppressWarnings("unchecked")
        List<String> summaryLines = (List<String>) result.get("summaryLines");
        assertEquals("Last date: 08 April 2036", summaryLines.get(0));
        assertEquals("Pay the semester examination fee with late fee of Rs 500 through the college online examination portal.",
            summaryLines.get(1));

        @SuppressWarnings("unchecked")
        List<String> noteItems = (List<String>) result.get("noteItems");
        assertTrue(noteItems.contains("Late fee: Rs 500."));
        assertTrue(noteItems.contains("Use the college online examination portal."));

        @SuppressWarnings("unchecked")
        List<String> rules = (List<String>) result.get("rules");
        assertTrue(rules.stream().anyMatch(rule -> rule.toLowerCase().contains("late fee")));
        assertTrue(rules.stream().anyMatch(rule -> rule.toLowerCase().contains("hall tickets")));

        @SuppressWarnings("unchecked")
        List<String> tags = (List<String>) result.get("tags");
        assertTrue(tags.contains("fee-payment"));
        assertTrue(tags.contains("late-fee"));
        assertFalse(tags.contains("event"));
    }

    @Test
    void extractsOpportunityDeadlineAndRequiredDocuments() {
        String sampleText = "Internship application must be submitted before 30 March 2036. Late submissions will not be accepted. Students must upload resume and ID proof.";

        Map<String, Object> result = service.analyzeText(sampleText, "internship-notice.png");

        assertEquals("OPPORTUNITY", result.get("category"));
        assertEquals("HIGH", result.get("priority"));
        assertEquals("HIGH", result.get("impact"));
        assertEquals(LocalDateTime.of(2036, 3, 30, 18, 0), result.get("dueDate"));
        assertEquals("If missed, late submissions will not be accepted.", result.get("impactSummary"));

        @SuppressWarnings("unchecked")
        List<String> requiredDocuments = (List<String>) result.get("requiredDocuments");
        assertTrue(requiredDocuments.contains("Resume"));
        assertTrue(requiredDocuments.contains("Id Proof"));
    }
}
