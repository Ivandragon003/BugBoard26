package it.unina.bugboard.util;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

public class ImageUtil {

    // tipi supportati (estensioni in lowercase, senza dot)
    private static final List<String> SUPPORTED_EXT = Arrays.asList("jpg","jpeg","png","gif","webp");

    /**
     * Salva l'immagine su filesystem e ritorna il percorso assoluto (String).
     * Lancia IOException o IllegalArgumentException su errore.
     *
     * @param file MultipartFile ricevuto
     * @param uploadDir path di root per gli upload (deve esistere o verrà creato)
     * @param maxBytes dimensione massima permessa in bytes
     * @return percorso relativo (es: issue/123/uuid-filename.ext) o percorso assoluto a seconda della tua preferenza
     * @throws IOException, IllegalArgumentException
     */
    public static String uploadImmagine(MultipartFile file, Path uploadDir, long maxBytes) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File mancante o vuoto");
        }

        if (file.getSize() > maxBytes) {
            throw new IllegalArgumentException("File troppo grande. Massimo consentito: " + maxBytes + " bytes");
        }

        String original = file.getOriginalFilename();
        if (original == null || !original.contains(".")) {
            throw new IllegalArgumentException("Nome file non valido");
        }

        String ext = original.substring(original.lastIndexOf('.') + 1).toLowerCase();
        if (!SUPPORTED_EXT.contains(ext)) {
            throw new IllegalArgumentException("Formato file non supportato. Formati ammessi: " + SUPPORTED_EXT);
        }

        // crea cartella se non esiste
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        // nome unico per evitare collisioni
        String uuid = UUID.randomUUID().toString();
        String savedFileName = uuid + "-" + sanitizeFilename(original);
        Path target = uploadDir.resolve(savedFileName);

        // scrivo il file atomico
        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IOException("Errore salvataggio file: " + e.getMessage(), e);
        }

        // opzione: setta permessi (se vuoi)
        try {
            target.toFile().setReadable(true, false);
            target.toFile().setWritable(true, true);
        } catch (Exception ignore) { }

        // ritorno percorso relativo (per esempio: uploads/uuid-file.ext)
        return target.toAbsolutePath().toString();
    }

    private static String sanitizeFilename(String name) {
        // rimuove caratteri pericolosi
        return name.replaceAll("[^a-zA-Z0-9\\.\\-_]", "_");
    }

    public static LocalDateTime now() {
        return LocalDateTime.now();
    }
}
