package com.timelysync.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Service
public class OCRService {

    @Value("${timelysync.smart-intake.tesseract-cmd:tesseract}")
    private String tesseractCommand;

    public ExtractedText extract(MultipartFile file, String pastedText) {
        String normalizedPastedText = normalizeText(pastedText);

        if (file == null || file.isEmpty()) {
            if (!normalizedPastedText.isBlank()) {
                return new ExtractedText(
                    normalizedPastedText,
                    "TEXT",
                    "pasted-text",
                    "text/plain",
                    List.of()
                );
            }
            throw new IllegalArgumentException("Please upload a document or paste text for Smart Intake.");
        }

        String originalFileName = StringUtils.hasText(file.getOriginalFilename()) ? file.getOriginalFilename() : "uploaded-document";
        String contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";
        List<String> warnings = new ArrayList<>();

        try {
            String extractedText;
            String sourceType;

            if (isPdf(originalFileName, contentType)) {
                sourceType = "PDF";
                extractedText = extractPdfText(file);
            } else if (isImage(originalFileName, contentType)) {
                sourceType = "IMAGE";
                extractedText = extractImageText(file);
            } else if (isPlainText(contentType, originalFileName)) {
                sourceType = "TEXT";
                extractedText = new String(file.getBytes(), StandardCharsets.UTF_8);
            } else {
                sourceType = "DOCUMENT";
                extractedText = new String(file.getBytes(), StandardCharsets.UTF_8);
                warnings.add("The document type is not optimized for OCR, so extraction may be incomplete.");
            }

            extractedText = normalizeText(extractedText);
            if (extractedText.isBlank() && !normalizedPastedText.isBlank()) {
                extractedText = normalizedPastedText;
                warnings.add("OCR returned very little text, so TimelySync used the pasted text instead.");
            }
            if (extractedText.isBlank()) {
                throw new IllegalStateException("TimelySync could not read text from this file. Try a clearer document or paste the text manually.");
            }

            return new ExtractedText(extractedText, sourceType, originalFileName, contentType, warnings);
        } catch (IOException exception) {
            throw new IllegalStateException("Smart Intake could not read the uploaded file.", exception);
        }
    }

    private String extractPdfText(MultipartFile file) throws IOException {
        try (InputStream inputStream = file.getInputStream();
             PDDocument document = PDDocument.load(inputStream)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    private String extractImageText(MultipartFile file) throws IOException {
        String extension = detectExtension(file.getOriginalFilename());
        Path inputFile = Files.createTempFile("timelysync-smart-intake-", extension);
        Path outputBase = Files.createTempFile("timelysync-smart-intake-out-", "");

        try {
            Files.write(inputFile, file.getBytes());

            ProcessBuilder processBuilder = new ProcessBuilder(
                tesseractCommand,
                inputFile.toString(),
                outputBase.toString(),
                "--psm",
                "6"
            );
            processBuilder.redirectErrorStream(true);

            Process process = processBuilder.start();
            String processOutput;
            try (InputStream inputStream = process.getInputStream();
                 ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
                inputStream.transferTo(outputStream);
                processOutput = outputStream.toString(StandardCharsets.UTF_8);
            }

            try {
                int exitCode = process.waitFor();
                if (exitCode != 0) {
                    throw new IllegalStateException("Tesseract OCR failed: " + processOutput.trim());
                }
            } catch (InterruptedException exception) {
                Thread.currentThread().interrupt();
                throw new IllegalStateException("Smart Intake OCR was interrupted.", exception);
            }

            Path outputTextFile = Path.of(outputBase.toString() + ".txt");
            if (!Files.exists(outputTextFile)) {
                throw new IllegalStateException("Tesseract OCR did not produce any output text.");
            }

            return Files.readString(outputTextFile, StandardCharsets.UTF_8);
        } finally {
            deleteIfExists(inputFile);
            deleteIfExists(outputBase);
            deleteIfExists(Path.of(outputBase.toString() + ".txt"));
        }
    }

    private boolean isPdf(String fileName, String contentType) {
        return contentType.contains("pdf") || fileName.toLowerCase().endsWith(".pdf");
    }

    private boolean isImage(String fileName, String contentType) {
        String lowerName = fileName.toLowerCase();
        return contentType.startsWith("image/")
            || lowerName.endsWith(".png")
            || lowerName.endsWith(".jpg")
            || lowerName.endsWith(".jpeg")
            || lowerName.endsWith(".bmp")
            || lowerName.endsWith(".tif")
            || lowerName.endsWith(".tiff");
    }

    private boolean isPlainText(String contentType, String fileName) {
        String lowerName = fileName.toLowerCase();
        return contentType.startsWith("text/")
            || lowerName.endsWith(".txt")
            || lowerName.endsWith(".md")
            || lowerName.endsWith(".csv");
    }

    private String normalizeText(String text) {
        if (!StringUtils.hasText(text)) {
            return "";
        }
        String normalized = text
            .replace("\r\n", "\n")
            .replace('\r', '\n')
            .replaceAll("[\\t\\x0B\\f]+", " ")
            .replaceAll(" +", " ")
            .replaceAll("\\n{3,}", "\n\n");
        return normalized.trim();
    }

    private String detectExtension(String fileName) {
        if (!StringUtils.hasText(fileName) || !fileName.contains(".")) {
            return ".png";
        }
        return fileName.substring(fileName.lastIndexOf('.'));
    }

    private void deleteIfExists(Path path) {
        try {
            Files.deleteIfExists(path);
        } catch (IOException ignored) {
        }
    }

    public static class ExtractedText {
        private final String text;
        private final String sourceType;
        private final String originalFileName;
        private final String contentType;
        private final List<String> warnings;

        public ExtractedText(String text, String sourceType, String originalFileName, String contentType, List<String> warnings) {
            this.text = text;
            this.sourceType = sourceType;
            this.originalFileName = originalFileName;
            this.contentType = contentType;
            this.warnings = warnings;
        }

        public String getText() {
            return text;
        }

        public String getSourceType() {
            return sourceType;
        }

        public String getOriginalFileName() {
            return originalFileName;
        }

        public String getContentType() {
            return contentType;
        }

        public List<String> getWarnings() {
            return warnings;
        }
    }
}
