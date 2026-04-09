package com.timelysync.service;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.format.ResolverStyle;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAccessor;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.regex.MatchResult;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AIExtractionService {

    private static final String DATE_REGEX =
        "\\b\\d{1,2}\\s+(?:jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\\s+\\d{4}\\b"
            + "|\\b(?:jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\\s+\\d{1,2},?\\s+\\d{4}\\b"
            + "|\\b\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4}\\b";

    private static final Pattern DATE_PATTERN = Pattern.compile("(" + DATE_REGEX + ")", Pattern.CASE_INSENSITIVE);

    private static final List<Pattern> DEADLINE_PATTERNS = List.of(
        Pattern.compile("(?:last date(?:\\s+for[^.]{0,160})?|deadline(?:\\s+for[^.]{0,160})?|due date(?:\\s+for[^.]{0,160})?)\\s*(?:is|are|:)?\\s*(" + DATE_REGEX + ")", Pattern.CASE_INSENSITIVE),
        Pattern.compile("on or before\\s+(" + DATE_REGEX + ")", Pattern.CASE_INSENSITIVE),
        Pattern.compile("(?:before|by)\\s+(" + DATE_REGEX + ")", Pattern.CASE_INSENSITIVE),
        Pattern.compile("(?:submit|submission|apply|application|register|registration|payment|pay|upload|complete)[^.]{0,120}?(?:before|by|on or before)\\s+(" + DATE_REGEX + ")", Pattern.CASE_INSENSITIVE),
        Pattern.compile("(?:closes?|ends?)\\s+on\\s+(" + DATE_REGEX + ")", Pattern.CASE_INSENSITIVE)
    );

    private static final Pattern SUBJECT_PATTERN = Pattern.compile("(?im)^subject\\s*:\\s*(.+)$");

    private static final Pattern DEADLINE_TITLE_PATTERN = Pattern.compile(
        "(?:last date|deadline)(?:\\s+for)?\\s+([^.!?]{6,120}?)\\s+(?:is|are|:)\\s+(?:" + DATE_REGEX + ")",
        Pattern.CASE_INSENSITIVE
    );

    private static final Pattern UPLOAD_OR_SUBMIT_PATTERN = Pattern.compile(
        "(?i)(?:upload|submit|attach|provide)\\s+([^.!?\\n]+)"
    );

    private static final Pattern MONEY_PATTERN = Pattern.compile("(?i)(rs\\.?\\s*\\d+)");

    private static final List<DateTimeFormatter> DATE_FORMATTERS = List.of(
        DateTimeFormatter.ofPattern("d MMMM uuuu", Locale.ENGLISH).withResolverStyle(ResolverStyle.SMART),
        DateTimeFormatter.ofPattern("d MMM uuuu", Locale.ENGLISH).withResolverStyle(ResolverStyle.SMART),
        DateTimeFormatter.ofPattern("MMMM d uuuu", Locale.ENGLISH).withResolverStyle(ResolverStyle.SMART),
        DateTimeFormatter.ofPattern("MMM d uuuu", Locale.ENGLISH).withResolverStyle(ResolverStyle.SMART),
        DateTimeFormatter.ofPattern("MMMM d, uuuu", Locale.ENGLISH).withResolverStyle(ResolverStyle.SMART),
        DateTimeFormatter.ofPattern("MMM d, uuuu", Locale.ENGLISH).withResolverStyle(ResolverStyle.SMART),
        DateTimeFormatter.ofPattern("d/M/uuuu", Locale.ENGLISH).withResolverStyle(ResolverStyle.SMART),
        DateTimeFormatter.ofPattern("d-M-uuuu", Locale.ENGLISH).withResolverStyle(ResolverStyle.SMART),
        DateTimeFormatter.ofPattern("d/M/uu", Locale.ENGLISH).withResolverStyle(ResolverStyle.SMART),
        DateTimeFormatter.ofPattern("d-M-uu", Locale.ENGLISH).withResolverStyle(ResolverStyle.SMART)
    );

    private static final List<String> DOCUMENT_KEYWORDS = List.of(
        "resume",
        "cv",
        "id proof",
        "identity proof",
        "passport",
        "photo",
        "photograph",
        "signature",
        "cover letter",
        "recommendation letter",
        "transcript",
        "marksheet",
        "mark sheet",
        "certificate",
        "offer letter",
        "admit card",
        "application form",
        "aadhaar",
        "aadhar",
        "pan card"
    );

    public Map<String, Object> analyzeText(String rawText, String sourceLabel) {
        String text = normalize(rawText);
        List<String> warnings = new ArrayList<>();
        if (text.isBlank()) {
            warnings.add("No readable text was found in the document.");
        }

        LocalDateTime dueDate = extractDueDate(text);
        if (dueDate == null) {
            warnings.add("No clear deadline was detected. Please review the due date before saving.");
        }

        List<String> rules = extractRules(text);
        if (rules.isEmpty()) {
            warnings.add("No explicit rules were detected, so you may want to review the document manually.");
        }

        List<String> requiredDocuments = extractRequiredDocuments(text);
        String actionSummary = extractActionSummary(text, requiredDocuments);
        String impactSummary = extractImpactSummary(text);
        String impact = classifyImpact(text, impactSummary);
        String category = detectCategory(text, sourceLabel);
        String priority = determinePriority(dueDate, impact, text);
        String effort = estimateEffort(requiredDocuments, text);
        List<String> tags = buildTags(category, requiredDocuments, text);
        String title = buildTitle(text, sourceLabel, category);
        List<String> summaryLines = buildSummaryLines(dueDate, actionSummary, impactSummary);
        String description = buildDescription(text, dueDate, rules, requiredDocuments, impactSummary, actionSummary, summaryLines);
        List<String> noteItems = buildNoteItems(text, rules, requiredDocuments, actionSummary, impactSummary);
        String notes = buildNotes(noteItems);
        int confidence = buildConfidence(dueDate, rules, requiredDocuments, impactSummary);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("title", title);
        result.put("description", description);
        result.put("category", category);
        result.put("priority", priority);
        result.put("impact", impact);
        result.put("effort", effort);
        result.put("dueDate", dueDate);
        result.put("rules", rules);
        result.put("requiredDocuments", requiredDocuments);
        result.put("actionSummary", actionSummary);
        result.put("impactSummary", impactSummary);
        result.put("summaryLines", summaryLines);
        result.put("noteItems", noteItems);
        result.put("notes", notes);
        result.put("tags", tags);
        result.put("confidence", confidence);
        result.put("warnings", warnings);
        return result;
    }

    private LocalDateTime extractDueDate(String text) {
        String semanticText = toSemanticText(text);

        Optional<LocalDateTime> contextualDueDate = extractContextualDueDate(semanticText);
        if (contextualDueDate.isPresent()) {
            return contextualDueDate.get();
        }

        List<DateCandidate> candidates = extractDateCandidates(semanticText);
        return candidates.stream()
            .filter(candidate -> !candidate.getDate().isBefore(LocalDateTime.now().minusDays(1)))
            .sorted(Comparator.comparingInt(DateCandidate::getScore).reversed()
                .thenComparing(DateCandidate::getDate))
            .map(DateCandidate::getDate)
            .findFirst()
            .orElseGet(() -> candidates.stream()
                .sorted(Comparator.comparingInt(DateCandidate::getScore).reversed()
                    .thenComparing(DateCandidate::getDate))
                .map(DateCandidate::getDate)
                .findFirst()
                .orElse(null));
    }

    private Optional<LocalDateTime> parseDate(String dateText) {
        String normalized = dateText
            .replaceAll("(?i)sept", "Sep")
            .replaceAll("\\s+", " ")
            .trim();

        for (DateTimeFormatter formatter : DATE_FORMATTERS) {
            try {
                TemporalAccessor accessor = formatter.parse(normalized);
                return Optional.of(LocalDate.from(accessor).atTime(LocalTime.of(18, 0)));
            } catch (DateTimeParseException ignored) {
            }
        }
        return Optional.empty();
    }

    private Optional<LocalDateTime> extractContextualDueDate(String semanticText) {
        List<LocalDateTime> candidates = new ArrayList<>();
        for (Pattern pattern : DEADLINE_PATTERNS) {
            Matcher matcher = pattern.matcher(semanticText);
            while (matcher.find()) {
                parseDate(matcher.group(1)).ifPresent(candidates::add);
            }
        }

        return chooseBestDate(candidates);
    }

    private Optional<LocalDateTime> chooseBestDate(List<LocalDateTime> candidates) {
        return candidates.stream()
            .distinct()
            .filter(date -> !date.isBefore(LocalDateTime.now().minusDays(1)))
            .sorted(Comparator.naturalOrder())
            .findFirst()
            .or(() -> candidates.stream().distinct().sorted(Comparator.naturalOrder()).findFirst());
    }

    private List<DateCandidate> extractDateCandidates(String semanticText) {
        List<DateCandidate> candidates = new ArrayList<>();
        Matcher matcher = DATE_PATTERN.matcher(semanticText);
        while (matcher.find()) {
            MatchResult match = matcher.toMatchResult();
            parseDate(match.group(1)).ifPresent(date -> {
                String context = extractContext(semanticText, match.start(), match.end());
                candidates.add(new DateCandidate(date, scoreDateContext(context)));
            });
        }
        return candidates;
    }

    private String extractContext(String text, int start, int end) {
        int contextStart = Math.max(0, start - 120);
        int contextEnd = Math.min(text.length(), end + 120);
        return text.substring(contextStart, contextEnd);
    }

    private int scoreDateContext(String context) {
        String lower = context.toLowerCase(Locale.ENGLISH);
        int score = 0;

        if (containsAny(lower, "last date", "deadline", "due date")) {
            score += 120;
        }
        if (containsAny(lower, "on or before", "before the deadline", "must be submitted")) {
            score += 90;
        }
        if (containsAny(lower, "payment", "fee", "submit", "submission", "application")) {
            score += 45;
        }
        if (containsAny(lower, "examination", "exam", "hall ticket")) {
            score += 25;
        }
        if (containsAny(lower, "submit", "submission", "apply", "application", "register", "registration", "upload", "payment", "pay")) {
            score += 20;
        }
        if (containsAny(lower, "date:", "dated", "issued on")) {
            score -= 130;
        }
        if (containsAny(lower, "circular no")) {
            score -= 20;
        }

        return score;
    }

    private List<String> extractRules(String text) {
        List<RankedText> rankedRules = splitSentences(text).stream()
            .map(String::trim)
            .filter(sentence -> !sentence.isBlank())
            .map(sentence -> new RankedText(summarizeRuleSentence(sentence), scoreRuleSentence(sentence)))
            .filter(candidate -> StringUtils.hasText(candidate.getText()))
            .filter(candidate -> candidate.getScore() > 0)
            .sorted(Comparator.comparingInt(RankedText::getScore).reversed())
            .collect(Collectors.toList());

        LinkedHashSet<String> rules = new LinkedHashSet<>();
        for (RankedText candidate : rankedRules) {
            if (rules.size() >= 5) {
                break;
            }
            rules.add(candidate.getText());
        }
        return new ArrayList<>(rules);
    }

    private List<String> extractRequiredDocuments(String text) {
        Set<String> documents = new LinkedHashSet<>();
        String lowerText = text.toLowerCase(Locale.ENGLISH);

        for (String keyword : DOCUMENT_KEYWORDS) {
            if (lowerText.contains(keyword)) {
                documents.add(toTitleCase(keyword));
            }
        }

        Matcher matcher = UPLOAD_OR_SUBMIT_PATTERN.matcher(text);
        while (matcher.find()) {
            String phrase = matcher.group(1)
                .replaceAll("(?i)must|shall|required|before.*", "")
                .trim();
            for (String part : phrase.split(",| and | & ")) {
                String cleaned = part
                    .replaceAll("(?i)the ", "")
                    .replaceAll("[^A-Za-z0-9 /-]", "")
                    .trim();
                if (cleaned.length() >= 3 && cleaned.length() <= 40) {
                    documents.add(toTitleCase(cleaned));
                }
            }
        }

        return new ArrayList<>(documents).stream().limit(6).collect(Collectors.toList());
    }

    private String extractImpactSummary(String text) {
        return splitSentences(text).stream()
            .map(String::trim)
            .map(sentence -> new RankedText(summarizeImpactSentence(sentence), scoreImpactSentence(sentence)))
            .filter(candidate -> StringUtils.hasText(candidate.getText()))
            .filter(candidate -> candidate.getScore() > 0)
            .sorted(Comparator.comparingInt(RankedText::getScore).reversed())
            .map(RankedText::getText)
            .findFirst()
            .orElse("Missing the deadline may affect the outcome of this task.");
    }

    private String extractActionSummary(String text, List<String> requiredDocuments) {
        String lowerText = text.toLowerCase(Locale.ENGLISH);
        if (containsAny(lowerText, "examination fee", "exam fee", "late fee")) {
            String amount = extractMoney(text);
            StringBuilder builder = new StringBuilder("Pay the semester examination fee");
            if (containsAny(lowerText, "late fee")) {
                builder.append(" with late fee");
            }
            if (StringUtils.hasText(amount)) {
                builder.append(" of ").append(formatMoney(amount));
            }
            if (containsAny(lowerText, "online examination portal", "examination portal")) {
                builder.append(" through the college online examination portal");
            }
            return builder.append(".").toString();
        }

        Optional<String> actionSentence = splitSentences(text).stream()
            .map(String::trim)
            .map(sentence -> new RankedText(summarizeActionSentence(sentence, requiredDocuments), scoreActionSentence(sentence)))
            .filter(candidate -> StringUtils.hasText(candidate.getText()))
            .filter(candidate -> candidate.getScore() > 0)
            .sorted(Comparator.comparingInt(RankedText::getScore).reversed())
            .map(RankedText::getText)
            .findFirst();

        if (actionSentence.isPresent()) {
            return actionSentence.get();
        }

        if (!requiredDocuments.isEmpty()) {
            return "Upload " + String.join(", ", requiredDocuments) + ".";
        }

        return "Review the notice and complete the required task before the deadline.";
    }

    private String classifyImpact(String text, String impactSummary) {
        String lowerText = (text + " " + impactSummary).toLowerCase(Locale.ENGLISH);
        if (containsAny(lowerText,
            "will not be permitted",
            "not be generated",
            "hall ticket",
            "not accepted",
            "disqualified",
            "rejected",
            "late submission",
            "mandatory")) {
            return "HIGH";
        }
        if (containsAny(lowerText, "important", "must", "deadline", "required", "late fee")) {
            return "MEDIUM";
        }
        return "LOW";
    }

    private String detectCategory(String text, String sourceLabel) {
        String lower = (text + " " + (sourceLabel == null ? "" : sourceLabel)).toLowerCase(Locale.ENGLISH);
        if (containsAny(lower, "internship", "interview", "resume", "job", "company", "application")) {
            return "OPPORTUNITY";
        }
        if (containsAny(lower,
            "examination",
            "semester",
            "hall ticket",
            "controller of examinations",
            "exam fee",
            "examination fee",
            "college online examination portal",
            "b.tech",
            "m.tech",
            "mba")) {
            return "ACADEMIC";
        }
        if (containsAny(lower, "event", "hackathon", "workshop", "seminar", "conference", "webinar", "meeting")) {
            return "EVENT";
        }
        if (containsAny(lower, "goal", "habit", "fitness", "course", "learn", "practice")) {
            return "PERSONAL_GOAL";
        }
        return "ACADEMIC";
    }

    private String determinePriority(LocalDateTime dueDate, String impact, String text) {
        if (containsAny(text.toLowerCase(Locale.ENGLISH), "urgent", "immediately", "as soon as possible")) {
            return "HIGH";
        }
        if ("HIGH".equals(impact)) {
            return "HIGH";
        }
        if (dueDate != null) {
            long days = ChronoUnit.DAYS.between(LocalDate.now(), dueDate.toLocalDate());
            if (days <= 7) {
                return "HIGH";
            }
            if (days <= 14) {
                return "MEDIUM";
            }
        }
        return "MEDIUM";
    }

    private String estimateEffort(List<String> requiredDocuments, String text) {
        if (requiredDocuments.size() >= 4 || text.length() > 1200) {
            return "HIGH";
        }
        if (requiredDocuments.size() >= 2 || text.length() > 300) {
            return "MEDIUM";
        }
        return "LOW";
    }

    private List<String> buildTags(String category, List<String> requiredDocuments, String text) {
        LinkedHashSet<String> tags = new LinkedHashSet<>();
        tags.add(category.toLowerCase(Locale.ENGLISH));
        String lower = text.toLowerCase(Locale.ENGLISH);
        if (containsAny(lower, "deadline", "before", "due", "last date")) {
            tags.add("deadline");
        }
        if (containsAny(lower, "examination", "semester")) {
            tags.add("examination");
        }
        if (containsAny(lower, "fee")) {
            tags.add("fee-payment");
        }
        if (containsAny(lower, "late fee")) {
            tags.add("late-fee");
        }
        if (containsAny(lower, "hall ticket")) {
            tags.add("hall-ticket");
        }
        requiredDocuments.stream()
            .limit(3)
            .map(value -> value.toLowerCase(Locale.ENGLISH).replace(' ', '-'))
            .forEach(tags::add);
        return new ArrayList<>(tags);
    }

    private String buildTitle(String text, String sourceLabel, String category) {
        String subjectLine = extractSubjectLine(text);
        if (StringUtils.hasText(subjectLine)) {
            return cropTitle(subjectLine);
        }

        String deadlinePhraseTitle = extractTitleFromDeadlinePhrase(text);
        if (StringUtils.hasText(deadlinePhraseTitle)) {
            return cropTitle(deadlinePhraseTitle);
        }

        for (String sentence : splitSentences(text)) {
            String candidate = sentence.trim();
            if (candidate.length() < 8) {
                continue;
            }
            String lower = candidate.toLowerCase(Locale.ENGLISH);
            if (lower.contains("must be submitted")) {
                String prefix = candidate.substring(0, lower.indexOf("must be submitted")).trim();
                if (!prefix.isBlank()) {
                    return toTitleCase(prefix) + " Submission";
                }
            }
            if (lower.contains("application")) {
                return cropTitle(toTitleCase(candidate));
            }
        }

        if (StringUtils.hasText(sourceLabel)) {
            String cleaned = sourceLabel.replaceAll("\\.[A-Za-z0-9]+$", "").replaceAll("[_-]+", " ").trim();
            if (!cleaned.isBlank()) {
                return cropTitle(toTitleCase(cleaned));
            }
        }

        if ("OPPORTUNITY".equals(category)) {
            return "Opportunity Submission";
        }
        if ("EVENT".equals(category)) {
            return "Event Commitment";
        }
        if ("PERSONAL_GOAL".equals(category)) {
            return "Personal Goal Task";
        }
        if (containsAny(text.toLowerCase(Locale.ENGLISH), "examination fee", "exam fee")) {
            return "Examination Fee Payment";
        }
        return "Academic Submission";
    }

    private String buildDescription(String text,
                                    LocalDateTime dueDate,
                                    List<String> rules,
                                    List<String> requiredDocuments,
                                    String impactSummary,
                                    String actionSummary,
                                    List<String> summaryLines) {
        if (!summaryLines.isEmpty()) {
            return String.join("\n", summaryLines);
        }

        List<String> fallbackLines = new ArrayList<>();
        if (dueDate != null) {
            fallbackLines.add("Last date: " + formatReadableDate(dueDate));
        }
        if (StringUtils.hasText(actionSummary)) {
            fallbackLines.add(actionSummary);
        } else if (!requiredDocuments.isEmpty()) {
            fallbackLines.add("Required documents: " + String.join(", ", requiredDocuments));
        } else if (!rules.isEmpty()) {
            fallbackLines.add(rules.get(0));
        }
        fallbackLines.add(impactSummary);
        return String.join("\n", fallbackLines.stream()
            .filter(StringUtils::hasText)
            .limit(3)
            .collect(Collectors.toList()));
    }

    private String buildNotes(List<String> noteItems) {
        return noteItems.stream()
            .filter(StringUtils::hasText)
            .map(item -> "- " + item)
            .collect(Collectors.joining("\n"));
    }

    private int buildConfidence(LocalDateTime dueDate,
                                List<String> rules,
                                List<String> requiredDocuments,
                                String impactSummary) {
        int confidence = 55;
        if (dueDate != null) {
            confidence += 15;
        }
        if (rules.size() >= 2) {
            confidence += 15;
        } else if (!rules.isEmpty()) {
            confidence += 10;
        }
        if (!requiredDocuments.isEmpty()) {
            confidence += 10;
        }
        if (StringUtils.hasText(impactSummary)) {
            confidence += 5;
        }
        return Math.min(confidence, 95);
    }

    private List<String> buildSummaryLines(LocalDateTime dueDate, String actionSummary, String impactSummary) {
        List<String> summaryLines = new ArrayList<>();

        if (dueDate != null) {
            summaryLines.add("Last date: " + formatReadableDate(dueDate));
        }
        if (StringUtils.hasText(actionSummary)) {
            summaryLines.add(actionSummary);
        }
        if (StringUtils.hasText(impactSummary)) {
            summaryLines.add(impactSummary.startsWith("If missed")
                ? impactSummary
                : "If missed: " + uncapitalizeFirstLetter(stripTrailingPeriod(impactSummary)) + ".");
        }

        return summaryLines.stream()
            .filter(StringUtils::hasText)
            .limit(3)
            .collect(Collectors.toList());
    }

    private List<String> splitSentences(String text) {
        if (!StringUtils.hasText(text)) {
            return List.of();
        }
        String semanticText = toSemanticText(text);
        return Arrays.stream(semanticText.split("(?<=[.!?])\\s+|\\n{2,}"))
            .map(String::trim)
            .filter(sentence -> !sentence.isBlank())
            .collect(Collectors.toList());
    }

    private String normalize(String text) {
        if (!StringUtils.hasText(text)) {
            return "";
        }
        return text
            .replace("\r\n", "\n")
            .replace('\r', '\n')
            .replaceAll("[\\t\\x0B\\f]+", " ")
            .replaceAll(" +", " ")
            .replaceAll("\\n{3,}", "\n\n")
            .trim();
    }

    private String toSemanticText(String text) {
        return text
            .replaceAll(" *\\n *", "\n")
            .replaceAll("\\n{3,}", "\n\n")
            .replaceAll("(?<!\\n)\\n(?!\\n)", " ")
            .replaceAll(" +", " ")
            .trim();
    }

    private String extractSubjectLine(String text) {
        Matcher matcher = SUBJECT_PATTERN.matcher(text);
        if (!matcher.find()) {
            return null;
        }

        String subject = matcher.group(1)
            .replaceAll("(?i)\\s*[–—-]\\s*reg\\.?$", "")
            .replaceAll("\\s+", " ")
            .trim();

        return StringUtils.hasText(subject) ? subject : null;
    }

    private String extractTitleFromDeadlinePhrase(String text) {
        Matcher matcher = DEADLINE_TITLE_PATTERN.matcher(toSemanticText(text));
        if (!matcher.find()) {
            return null;
        }

        String phrase = matcher.group(1)
            .replaceAll("(?i)^for\\s+", "")
            .replaceAll("(?i)\\bthe\\b", "the")
            .replaceAll("\\s+", " ")
            .trim();

        return StringUtils.hasText(phrase) ? toTitleCase(phrase) : null;
    }

    private String cropTitle(String title) {
        return title.length() > 70 ? title.substring(0, 67).trim() + "..." : title;
    }

    private String cropText(String text, int maxLength) {
        if (!StringUtils.hasText(text)) {
            return "";
        }
        return text.length() > maxLength ? text.substring(0, maxLength - 3).trim() + "..." : text;
    }

    private String toTitleCase(String value) {
        return Arrays.stream(value.trim().split("\\s+"))
            .filter(part -> !part.isBlank())
            .map(part -> part.length() == 1
                ? part.toUpperCase(Locale.ENGLISH)
                : part.substring(0, 1).toUpperCase(Locale.ENGLISH) + part.substring(1).toLowerCase(Locale.ENGLISH))
            .collect(Collectors.joining(" "));
    }

    private String summarizeRuleSentence(String sentence) {
        String lower = sentence.toLowerCase(Locale.ENGLISH);
        String cleaned = normalizeSentence(sentence);

        if (containsAny(lower, "will not be permitted", "hall ticket", "hall tickets")) {
            return "If missed, you cannot appear for the semester examinations and hall tickets will not be generated.";
        }
        if (containsAny(lower, "late submissions will not be accepted", "late submission will not be accepted")) {
            return "Late submissions will not be accepted.";
        }
        if (containsAny(lower, "required to pay", "pay the fee", "late fee")) {
            String amount = extractMoney(sentence);
            StringBuilder builder = new StringBuilder("Pay the examination fee");
            if (StringUtils.hasText(amount)) {
                builder.append(" with late fee of ").append(formatMoney(amount));
            } else if (containsAny(lower, "late fee")) {
                builder.append(" with late fee");
            }
            if (containsAny(lower, "portal")) {
                builder.append(" through the college online examination portal");
            }
            return builder.append(".").toString();
        }
        if (containsAny(lower, "upload", "resume", "id proof", "application form")) {
            List<String> documents = extractRequiredDocuments(sentence);
            if (!documents.isEmpty()) {
                return "Upload " + String.join(", ", documents) + ".";
            }
        }

        return cropText(cleaned, 140);
    }

    private String summarizeImpactSentence(String sentence) {
        String lower = sentence.toLowerCase(Locale.ENGLISH);
        if (containsAny(lower, "will not be permitted", "hall ticket", "hall tickets")) {
            return "If missed, you cannot appear for the semester examinations and hall tickets will not be generated.";
        }
        if (containsAny(lower, "late submissions will not be accepted", "not accepted")) {
            return "If missed, late submissions will not be accepted.";
        }
        if (containsAny(lower, "disqualified", "rejected")) {
            return "If missed, the submission may be rejected.";
        }
        if (containsAny(lower, "late fee", "penalty")) {
            String amount = extractMoney(sentence);
            return StringUtils.hasText(amount)
                ? "If delayed, a penalty of " + formatMoney(amount) + " applies."
                : "If delayed, a late fee applies.";
        }
        return cropText(normalizeSentence(sentence), 140);
    }

    private String summarizeActionSentence(String sentence, List<String> requiredDocuments) {
        String lower = sentence.toLowerCase(Locale.ENGLISH);
        if (containsAny(lower, "required to pay", "pay the examination fee", "late fee", "payment of")) {
            String amount = extractMoney(sentence);
            StringBuilder builder = new StringBuilder("Pay the semester examination fee");
            if (containsAny(lower, "late fee")) {
                builder.append(" with late fee");
            }
            if (StringUtils.hasText(amount)) {
                builder.append(" of ").append(amount.toUpperCase(Locale.ENGLISH));
            }
            if (containsAny(lower, "portal")) {
                builder.append(" through the college online examination portal");
            }
            return builder.append(".").toString();
        }
        if (containsAny(lower, "must be submitted", "submit")) {
            return cropText(normalizeSentence(sentence), 140);
        }
        if (containsAny(lower, "upload", "attach", "provide")) {
            List<String> documents = !requiredDocuments.isEmpty() ? requiredDocuments : extractRequiredDocuments(sentence);
            if (!documents.isEmpty()) {
                return "Upload " + String.join(", ", documents) + ".";
            }
        }
        return cropText(normalizeSentence(sentence), 140);
    }

    private int scoreActionSentence(String sentence) {
        String lower = sentence.toLowerCase(Locale.ENGLISH);
        int score = 0;

        if (containsAny(lower, "required to pay", "must pay", "pay the fee", "payment of")) {
            score += 125;
        }
        if (containsAny(lower, "must submit", "must be submitted", "submit")) {
            score += 110;
        }
        if (containsAny(lower, "upload", "attach", "provide")) {
            score += 95;
        }
        if (containsAny(lower, "late fee", "portal")) {
            score += 55;
        }
        if (containsAny(lower, "clarification", "contact")) {
            score -= 80;
        }

        return score;
    }

    private List<String> buildNoteItems(String text,
                                        List<String> rules,
                                        List<String> requiredDocuments,
                                        String actionSummary,
                                        String impactSummary) {
        LinkedHashSet<String> notes = new LinkedHashSet<>();

        String amount = extractMoney(text);
        if (StringUtils.hasText(amount)) {
            notes.add("Late fee: " + formatMoney(amount) + ".");
        }

        if (containsAny(text.toLowerCase(Locale.ENGLISH), "portal", "online portal")) {
            notes.add("Use the college online examination portal.");
        }

        if (!requiredDocuments.isEmpty()) {
            notes.add("Required documents: " + String.join(", ", requiredDocuments) + ".");
        }

        for (String rule : rules) {
            if (notes.size() >= 4) {
                break;
            }
            if (isRedundantNote(rule, actionSummary, impactSummary, notes)) {
                continue;
            }
            notes.add(stripTrailingPeriod(rule) + ".");
        }

        return new ArrayList<>(notes);
    }

    private boolean isRedundantNote(String candidate,
                                    String actionSummary,
                                    String impactSummary,
                                    Set<String> existingNotes) {
        String normalizedCandidate = normalizeForComparison(candidate);
        if (normalizedCandidate.isBlank()) {
            return true;
        }

        if (normalizedCandidate.equals(normalizeForComparison(actionSummary))
            || normalizedCandidate.equals(normalizeForComparison(impactSummary))) {
            return true;
        }

        if (containsAny(normalizedCandidate, "all heads of departments", "clarification", "working hours", "requested to inform")) {
            return true;
        }

        for (String note : existingNotes) {
            String normalizedNote = normalizeForComparison(note);
            if (normalizedNote.contains(normalizedCandidate) || normalizedCandidate.contains(normalizedNote)) {
                return true;
            }
        }

        return false;
    }

    private String normalizeSentence(String sentence) {
        return sentence.replaceAll("\\s+", " ").trim();
    }

    private String extractMoney(String text) {
        Matcher matcher = MONEY_PATTERN.matcher(text);
        if (matcher.find()) {
            return matcher.group(1).replaceAll("\\s+", " ").trim();
        }
        return null;
    }

    private String formatMoney(String amount) {
        return amount
            .replaceAll("(?i)rs\\.?", "Rs")
            .replaceAll("\\s+", " ")
            .trim();
    }

    private String formatReadableDate(LocalDateTime dueDate) {
        return dueDate.toLocalDate().format(DateTimeFormatter.ofPattern("dd MMMM uuuu", Locale.ENGLISH));
    }

    private String stripTrailingPeriod(String value) {
        return value == null ? "" : value.replaceAll("\\.+$", "").trim();
    }

    private String uncapitalizeFirstLetter(String value) {
        if (!StringUtils.hasText(value)) {
            return "";
        }
        if (value.length() == 1) {
            return value.toLowerCase(Locale.ENGLISH);
        }
        return value.substring(0, 1).toLowerCase(Locale.ENGLISH) + value.substring(1);
    }

    private String normalizeForComparison(String value) {
        if (!StringUtils.hasText(value)) {
            return "";
        }
        return value.toLowerCase(Locale.ENGLISH)
            .replaceAll("[^a-z0-9 ]", " ")
            .replaceAll("\\s+", " ")
            .trim();
    }

    private boolean containsAny(String text, String... candidates) {
        for (String candidate : candidates) {
            if (text.contains(candidate)) {
                return true;
            }
        }
        return false;
    }

    private int scoreRuleSentence(String sentence) {
        String lower = sentence.toLowerCase(Locale.ENGLISH);
        int score = 0;

        if (containsAny(lower, "last date", "deadline")) {
            score += 120;
        }
        if (containsAny(lower, "required to", "must", "mandatory")) {
            score += 85;
        }
        if (containsAny(lower, "late fee", "on or before")) {
            score += 80;
        }
        if (containsAny(lower, "will not be permitted", "hall ticket", "not be generated")) {
            score += 125;
        }
        if (containsAny(lower, "through the college online examination portal", "submit", "payment")) {
            score += 40;
        }
        if (containsAny(lower, "clarification", "working hours")) {
            score -= 60;
        }
        if (containsAny(lower, "requested to inform")) {
            score -= 10;
        }

        return score;
    }

    private int scoreImpactSentence(String sentence) {
        String lower = sentence.toLowerCase(Locale.ENGLISH);
        int score = 0;

        if (containsAny(lower, "will not be permitted", "not be generated", "hall ticket")) {
            score += 140;
        }
        if (containsAny(lower, "rejected", "disqualified", "not accepted")) {
            score += 120;
        }
        if (containsAny(lower, "late fee", "penalty")) {
            score += 70;
        }
        if (containsAny(lower, "deadline", "late submission")) {
            score += 55;
        }

        return score;
    }

    private static class DateCandidate {
        private final LocalDateTime date;
        private final int score;

        private DateCandidate(LocalDateTime date, int score) {
            this.date = date;
            this.score = score;
        }

        private LocalDateTime getDate() {
            return date;
        }

        private int getScore() {
            return score;
        }
    }

    private static class RankedText {
        private final String text;
        private final int score;

        private RankedText(String text, int score) {
            this.text = text;
            this.score = score;
        }

        private String getText() {
            return text;
        }

        private int getScore() {
            return score;
        }
    }
}
