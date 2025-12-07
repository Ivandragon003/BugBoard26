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
	private static final String[] ALLOWED_EXTENSIONS = { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf", ".doc",
			".docx" };

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

		Path uploadDir = Paths.get(UPLOAD_BASE_DIR);

		if (!Files.exists(uploadDir)) {
			Files.createDirectories(uploadDir);
		}

		String uniqueFilename = UUID.randomUUID().toString() + extension;
		Path filePath = uploadDir.resolve(uniqueFilename);

		Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

		logger.info("File caricato: {} ({} bytes)", uniqueFilename, file.getSize());

		return filePath.toAbsolutePath().toString();
	}

	public void deleteImmagine(String percorso) throws IOException {
		if (percorso == null || percorso.isBlank()) {
			throw new InvalidInputException("Percorso non valido");
		}

		Path path = Paths.get(percorso);
		if (Files.exists(path)) {
			Files.delete(path);
			logger.info("File eliminato: {}", path.getFileName());
		}
	}

	public boolean fileExists(String percorso) {
		if (percorso == null || percorso.isBlank()) {
			return false;
		}
		return Files.exists(Paths.get(percorso));
	}

	public byte[] getImageBytes(String percorso) throws IOException {
		if (percorso == null || percorso.isBlank()) {
			throw new InvalidInputException("Percorso non valido");
		}

		Path path = Paths.get(percorso);
		if (!Files.exists(path)) {
			throw new InvalidInputException("File non trovato: " + percorso);
		}

		return Files.readAllBytes(path);
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