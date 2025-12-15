package it.unina.bugboard.controller;

import it.unina.bugboard.dao.AllegatoDAO;
import it.unina.bugboard.dao.IssueDAO;
import it.unina.bugboard.model.Allegato;
import it.unina.bugboard.model.Issue;
import it.unina.bugboard.exception.*;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("/api/allegato")
public class AllegatoController {

	private static final String MESSAGE_KEY = "message";
	private static final long MAX_FILE_SIZE = 10 * 1024 * 1024L; // 10MB
	private static final String[] ALLOWED_CONTENT_TYPES = {
		"image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
		"application/pdf",
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document"
	};

	private final AllegatoDAO allegatoDAO;
	private final IssueDAO issueDAO;

	public AllegatoController(AllegatoDAO allegatoDAO, IssueDAO issueDAO) {
		this.allegatoDAO = allegatoDAO;
		this.issueDAO = issueDAO;
	}

	@PostMapping("/upload")
	@Transactional
	public Map<String, Object> uploadAllegato(
			@RequestParam(value = "file") MultipartFile file,
			@RequestParam(value = "idIssue") Integer idIssue) throws IOException {
		
		
		if (file == null || file.isEmpty()) {
			throw new InvalidFieldException("File mancante o vuoto");
		}

		if (file.getSize() > MAX_FILE_SIZE) {
			throw new InvalidFieldException(
				String.format("Il file supera la dimensione massima consentita di %.0fMB", 
					MAX_FILE_SIZE / (1024.0 * 1024.0))
			);
		}

		String contentType = file.getContentType();
		if (contentType == null || !isAllowedContentType(contentType)) {
			throw new InvalidFieldException(
				"Tipo di file non supportato. Formati consentiti: immagini (JPG, PNG, GIF, WEBP), PDF, DOC, DOCX"
			);
		}

		// Verifica esistenza issue
		Issue issue = issueDAO.findById(idIssue)
				.orElseThrow(() -> new NotFoundException("Issue non trovata con id: " + idIssue));

		// Salva file nel database come byte array
		byte[] fileData = file.getBytes();
		Allegato allegato = new Allegato(
			file.getOriginalFilename(),
			contentType,
			(int) file.getSize(),
			fileData,
			issue
		);

		Allegato saved = allegatoDAO.save(allegato);

		// Restituisci info senza i bytes (per evitare JSON enormi)
		return Map.of(
			"idAllegato", saved.getIdAllegato(),
			"nomeFile", saved.getNomeFile(),
			"tipoFile", saved.getTipoFile(),
			"dimensione", saved.getDimensione(),
			"dataCaricamento", saved.getDataCaricamento(),
			MESSAGE_KEY, "File caricato con successo"
		);
	}

	@GetMapping("/download/{id}")
	@Transactional(readOnly = true)
	public ResponseEntity<ByteArrayResource> downloadAllegato(@PathVariable(value = "id") Integer id) {
		Allegato allegato = allegatoDAO.findById(id)
				.orElseThrow(() -> new NotFoundException("Allegato non trovato con id: " + id));

		byte[] data = allegato.getFileData();
		ByteArrayResource resource = new ByteArrayResource(data);

		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, 
					"attachment; filename=\"" + allegato.getNomeFile() + "\"")
				.contentType(MediaType.parseMediaType(allegato.getTipoFile()))
				.contentLength(data.length)
				.body(resource);
	}

	@GetMapping("/preview/{id}")
	@Transactional(readOnly = true)
	public ResponseEntity<ByteArrayResource> previewAllegato(@PathVariable(value = "id") Integer id) {
		Allegato allegato = allegatoDAO.findById(id)
				.orElseThrow(() -> new NotFoundException("Allegato non trovato con id: " + id));

		byte[] data = allegato.getFileData();
		ByteArrayResource resource = new ByteArrayResource(data);

		// Inline invece di attachment per visualizzazione diretta nel browser
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + allegato.getNomeFile() + "\"")
				.contentType(MediaType.parseMediaType(allegato.getTipoFile()))
				.contentLength(data.length)
				.body(resource);
	}

	@GetMapping("/issue/{idIssue}")
	@Transactional(readOnly = true)
	public List<Map<String, Object>> getAllegatiByIssue(@PathVariable(value = "idIssue") Integer idIssue) {
		verificaEsistenzaIssue(idIssue);
		
		List<Allegato> allegati = allegatoDAO.findByIssueIdIssue(idIssue);
		
		// Restituisci solo metadata senza i bytes (per performance)
		return allegati.stream()
			.map(a -> {
				Map<String, Object> map = new HashMap<>();
				map.put("idAllegato", a.getIdAllegato());
				map.put("nomeFile", a.getNomeFile());
				map.put("tipoFile", a.getTipoFile());
				map.put("dimensione", a.getDimensione());
				map.put("dimensioneMB", String.format("%.2f", a.getDimensione() / (1024.0 * 1024.0)));
				map.put("dataCaricamento", a.getDataCaricamento());
				return map;
			})
			.collect(java.util.stream.Collectors.toList());
	}

	@GetMapping("/issue/{idIssue}/ordinati-dimensione")
	@Transactional(readOnly = true)
	public List<Map<String, Object>> getAllegatiOrderByDimensione(@PathVariable(value = "idIssue") Integer idIssue) {
		verificaEsistenzaIssue(idIssue);
		
		List<Allegato> allegati = allegatoDAO.findAllegatiByIssueOrderByDimensioneDesc(idIssue);
		
		return allegati.stream()
			.map(a -> {
				Map<String, Object> map = new HashMap<>();
				map.put("idAllegato", a.getIdAllegato());
				map.put("nomeFile", a.getNomeFile());
				map.put("tipoFile", a.getTipoFile());
				map.put("dimensione", a.getDimensione());
				map.put("dimensioneMB", String.format("%.2f", a.getDimensione() / (1024.0 * 1024.0)));
				map.put("dataCaricamento", a.getDataCaricamento());
				return map;
			})
			.collect(java.util.stream.Collectors.toList());
	}

	@GetMapping("/issue/{idIssue}/dimensione-totale")
	@Transactional(readOnly = true)
	public Map<String, Object> getDimensioneTotale(@PathVariable(value = "idIssue") Integer idIssue) {
		verificaEsistenzaIssue(idIssue);
		
		Long totale = Optional.ofNullable(allegatoDAO.sumDimensioniByIssue(idIssue)).orElse(0L);

		return Map.of(
			"idIssue", idIssue, 
			"dimensioneTotaleBytes", totale, 
			"dimensioneTotaleMB", String.format("%.2f", totale / (1024.0 * 1024.0))
		);
	}

	@GetMapping("/issue/{idIssue}/count")
	@Transactional(readOnly = true)
	public Map<String, Object> countAllegati(@PathVariable(value = "idIssue") Integer idIssue) {
		verificaEsistenzaIssue(idIssue);
		long count = allegatoDAO.countByIssueIdIssue(idIssue);
		return Map.of("idIssue", idIssue, "numeroAllegati", count);
	}

	@DeleteMapping("/{id}")
	@Transactional
	public Map<String, String> eliminaAllegato(@PathVariable(value = "id") Integer id) {
		Allegato allegato = allegatoDAO.findById(id)
				.orElseThrow(() -> new NotFoundException("Allegato non trovato con id: " + id));

		allegatoDAO.delete(allegato);
		return Map.of(MESSAGE_KEY, "Allegato eliminato con successo");
	}

	// ===== METODI HELPER PRIVATI =====

	private void verificaEsistenzaIssue(Integer idIssue) {
		if (!issueDAO.existsById(idIssue)) {
			throw new NotFoundException("Issue non trovata con id: " + idIssue);
		}
	}

	private boolean isAllowedContentType(String contentType) {
		for (String allowed : ALLOWED_CONTENT_TYPES) {
			if (allowed.equalsIgnoreCase(contentType)) {
				return true;
			}
		}
		return false;
	}
}