package it.unina.bugboard.util;

import it.unina.bugboard.exception.InvalidInputException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Component
public class ImmagineUtil {
    private static final Logger logger = LoggerFactory.getLogger(ImmagineUtil.class);
    private static final String UPLOAD_BASE_DIR = "uploads/images/";
    private static final long MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
    private static final String[] ALLOWED_EXTENSIONS = { 
        ".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf", ".doc", ".docx" 
    };

    private Path getUploadDirectory() {
        String baseDir = System.getenv("WEBSITE_INSTANCE_ID") != null 
            ? "/home" 
            : System.getProperty("user.dir");
        
        return Paths.get(baseDir, UPLOAD_BASE_DIR);
    }

    public String uploadImmagine(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new InvalidInputException("File mancante o vuoto");
        }
        
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new InvalidInputException("File troppo grande. Massimo 5MB");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new InvalidInputException("Nome file non valido");
        }

        String extension = getFileExtension(originalFilename);
        if (!isAllowedExtension(extension)) {
            throw new InvalidInputException("Estensione file non supportata: " + extension);
        }

        Path uploadDir = getUploadDirectory();
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        String uniqueFilename = UUID.randomUUID().toString() + extension;
        Path filePath = uploadDir.resolve(uniqueFilename);
        
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        logger.info("File caricato: {}", uniqueFilename);

        return uniqueFilename;
    }

    public void deleteImmagine(String filename) throws IOException {
        if (filename == null || filename.isBlank()) {
            throw new InvalidInputException("Filename non valido");
        }

        Path path = getUploadDirectory().resolve(filename);
        
        if (Files.exists(path)) {
            Files.delete(path);
            logger.info("File eliminato: {}", filename);
        }
    }

    public boolean fileExists(String filename) {
        if (filename == null || filename.isBlank()) {
            return false;
        }
        return Files.exists(getUploadDirectory().resolve(filename));
    }

    public byte[] getImageBytes(String filename) throws IOException {
        if (filename == null || filename.isBlank()) {
            throw new InvalidInputException("Filename non valido");
        }

        Path path = getUploadDirectory().resolve(filename);
        
        if (!Files.exists(path)) {
            throw new InvalidInputException("File non trovato: " + filename);
        }
        
        if (!Files.isReadable(path)) {
            throw new InvalidInputException("File non leggibile: " + filename);
        }

        return Files.readAllBytes(path);
    }

    public String getContentType(String filename) {
        if (filename == null || filename.isBlank()) {
            return "application/octet-stream";
        }
        
        String lower = filename.toLowerCase();
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".gif")) return "image/gif";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".pdf")) return "application/pdf";
        if (lower.endsWith(".doc")) return "application/msword";
        if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        
        return "application/octet-stream";
    }

    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        return lastDotIndex == -1 ? "" : filename.substring(lastDotIndex).toLowerCase();
    }

    private boolean isAllowedExtension(String extension) {
        for (String allowed : ALLOWED_EXTENSIONS) {
            if (allowed.equalsIgnoreCase(extension)) {
                return true;
            }
        }
        return false;
    }
}