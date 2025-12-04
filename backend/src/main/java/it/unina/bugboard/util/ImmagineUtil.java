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
    private static final long MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
    private static final String[] ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf", ".doc", ".docx"};

    public String uploadImmagine(MultipartFile file) {
        logger.info("🔵 uploadImmagine() chiamato");
        
        if (file == null || file.isEmpty()) {
            logger.error("❌ File null o vuoto");
            throw new InvalidInputException("File mancante o vuoto");
        }

        logger.info("📊 File ricevuto: {} - Size: {} bytes", 
            file.getOriginalFilename(), file.getSize());

        if (file.getSize() > MAX_SIZE_BYTES) {
            logger.error("❌ File troppo grande: {} bytes (max: {})", 
                file.getSize(), MAX_SIZE_BYTES);
            throw new InvalidInputException("File troppo grande. Massimo 10MB");
        }
        
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            logger.error("❌ Nome file non valido");
            throw new InvalidInputException("Nome file non valido");
        }

        String extension = getFileExtension(originalFilename);
        logger.info("📝 Estensione rilevata: {}", extension);
        
        if (!isAllowedExtension(extension)) {
            logger.error("❌ Estensione non supportata: {}", extension);
            throw new InvalidInputException("Estensione file non supportata: " + extension);
        }

        try {
            Path uploadDir = Paths.get(UPLOAD_BASE_DIR);
            logger.info("📁 Directory upload: {}", uploadDir.toAbsolutePath());
            
            if (!Files.exists(uploadDir)) {
                logger.info("📂 Creazione directory: {}", uploadDir.toAbsolutePath());
                Files.createDirectories(uploadDir);
                logger.info("✅ Directory creata con successo");
            } else {
                logger.info("✅ Directory già esistente");
            }

            String uniqueFilename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadDir.resolve(uniqueFilename);
            
            logger.info("💾 Salvataggio file in: {}", filePath.toAbsolutePath());

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            logger.info("✅ File salvato con successo");
            logger.info("📍 Percorso completo: {}", filePath.toAbsolutePath().toString());
            
            // Verifica che il file esista effettivamente
            if (Files.exists(filePath)) {
                logger.info("✅ VERIFICA: File esiste sul filesystem");
                logger.info("📏 Dimensione file salvato: {} bytes", Files.size(filePath));
            } else {
                logger.error("❌ ERRORE: File NON esiste dopo il salvataggio!");
            }

            return filePath.toAbsolutePath().toString();
            
        } catch (IOException e) {
            logger.error("❌ Errore I/O durante il salvataggio", e);
            throw new RuntimeException("Errore durante il salvataggio del file: " + e.getMessage());
        }
    }

    public void deleteImmagine(String percorso) {
        logger.info("🗑️ deleteImmagine() chiamato per: {}", percorso);
        
        if (percorso == null || percorso.isBlank()) {
            logger.error("❌ Percorso non valido");
            throw new InvalidInputException("Percorso non valido");
        }

        try {
            Path path = Paths.get(percorso);
            if (Files.exists(path)) {
                Files.delete(path);
                logger.info("✅ File eliminato: {}", percorso);
            } else {
                logger.warn("⚠️ File non trovato (già eliminato?): {}", percorso);
            }
        } catch (IOException e) {
            logger.error("❌ Errore durante eliminazione", e);
            throw new RuntimeException("Errore durante l'eliminazione del file: " + e.getMessage());
        }
    }

    public boolean fileExists(String percorso) {
        if (percorso == null || percorso.isBlank()) {
            return false;
        }
        boolean exists = Files.exists(Paths.get(percorso));
        logger.debug("🔍 fileExists({}): {}", percorso, exists);
        return exists;
    }

    public byte[] getImageBytes(String percorso) {
        logger.info("📥 getImageBytes() chiamato per: {}", percorso);
        
        if (percorso == null || percorso.isBlank()) {
            logger.error("❌ Percorso non valido");
            throw new InvalidInputException("Percorso non valido");
        }

        try {
            Path path = Paths.get(percorso);
            if (!Files.exists(path)) {
                logger.error("❌ File non trovato: {}", percorso);
                throw new InvalidInputException("File non trovato: " + percorso);
            }
            
            byte[] bytes = Files.readAllBytes(path);
            logger.info("✅ File letto: {} bytes", bytes.length);
            return bytes;
            
        } catch (IOException e) {
            logger.error("❌ Errore durante lettura", e);
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