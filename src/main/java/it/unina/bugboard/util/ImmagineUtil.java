package it.unina.bugboard.util;

import it.unina.bugboard.exception.InvalidInputException;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Component
public class ImmagineUtil {

    private static final String UPLOAD_BASE_DIR = "uploads/images/";
    private static final long MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
    private static final String[] ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf", ".doc", ".docx"};

    public String uploadImmagine(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidInputException("File mancante o vuoto");
        }

        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new InvalidInputException("File troppo grande. Massimo 10MB");
        }
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new InvalidInputException("Nome file non valido");
        }

        String extension = getFileExtension(originalFilename);
        if (!isAllowedExtension(extension)) {
            throw new InvalidInputException("Estensione file non supportata: " + extension);
        }

        try {
            Path uploadDir = Paths.get(UPLOAD_BASE_DIR);
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            String uniqueFilename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadDir.resolve(uniqueFilename);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return filePath.toAbsolutePath().toString();
            
        } catch (IOException e) {
            throw new RuntimeException("Errore durante il salvataggio del file: " + e.getMessage());
        }
    }

    public void deleteImmagine(String percorso) {
        if (percorso == null || percorso.isBlank()) {
            throw new InvalidInputException("Percorso non valido");
        }

        try {
            Path path = Paths.get(percorso);
            if (Files.exists(path)) {
                Files.delete(path);
            }
        } catch (IOException e) {
            throw new RuntimeException("Errore durante l'eliminazione del file: " + e.getMessage());
        }
    }

    public boolean fileExists(String percorso) {
        if (percorso == null || percorso.isBlank()) {
            return false;
        }
        return Files.exists(Paths.get(percorso));
    }

    public byte[] getImageBytes(String percorso) {
        if (percorso == null || percorso.isBlank()) {
            throw new InvalidInputException("Percorso non valido");
        }

        try {
            Path path = Paths.get(percorso);
            if (!Files.exists(path)) {
                throw new InvalidInputException("File non trovato: " + percorso);
            }
            return Files.readAllBytes(path);
        } catch (IOException e) {
            throw new RuntimeException("Errore durante la lettura del file: " + e.getMessage());
        }
    }

    public String getContentType(String percorso) {
        if (percorso == null || percorso.isBlank()) {
            return "application/octet-stream";
        }

        String lower = percorso.toLowerCase();
        
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (lower.endsWith(".png")) {
            return "image/png";
        } else if (lower.endsWith(".gif")) {
            return "image/gif";
        } else if (lower.endsWith(".webp")) {
            return "image/webp";
        } else if (lower.endsWith(".pdf")) {
            return "application/pdf";
        } else if (lower.endsWith(".doc")) {
            return "application/msword";
        } else if (lower.endsWith(".docx")) {
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        }
        
        return "application/octet-stream";
    }

    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return "";
        }
        return filename.substring(lastDotIndex).toLowerCase();
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