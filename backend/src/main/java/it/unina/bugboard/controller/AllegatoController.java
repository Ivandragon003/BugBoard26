package it.unina.bugboard.controller;

import it.unina.bugboard.dao.AllegatoDAO;
import it.unina.bugboard.dao.IssueDAO;
import it.unina.bugboard.model.Allegato;
import it.unina.bugboard.model.Issue;
import it.unina.bugboard.exception.*;
import it.unina.bugboard.util.ImmagineUtil;
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

	private final AllegatoDAO allegatoDAO;
	private final IssueDAO issueDAO;
	private final ImmagineUtil immagineUtil;

	public AllegatoController(AllegatoDAO allegatoDAO, IssueDAO issueDAO, ImmagineUtil immagineUtil) {
		this.allegatoDAO = allegatoDAO;
		this.issueDAO = issueDAO;
		this.immagineUtil = immagineUtil;
	}

	@PostMapping("/upload")
	@Transactional
	public Allegato uploadAllegato(@RequestParam(value = "file") MultipartFile file,
			@RequestParam(value = "idIssue") Integer idIssue) throws IOException {
		Issue issue = issueDAO.findById(idIssue)
				.orElseThrow(() -> new NotFoundException("Issue non trovata con id: " + idIssue));

		if (file == null || file.isEmpty()) {
			throw new InvalidInputException("File mancante o vuoto");
		}

		String percorso = immagineUtil.uploadImmagine(file);

		Allegato allegato = new Allegato(percorso, file.getOriginalFilename(), file.getContentType(),
				(int) file.getSize(), issue);

		return allegatoDAO.save(allegato);
	}

	@GetMapping("/download/{id}")
	@Transactional(readOnly = true)
	public ResponseEntity<ByteArrayResource> downloadAllegato(@PathVariable(value = "id") Integer id)
			throws IOException {
		Allegato allegato = allegatoDAO.findById(id)
				.orElseThrow(() -> new NotFoundException("Allegato non trovato con id: " + id));

		byte[] data = immagineUtil.getImageBytes(allegato.getPercorso());
		ByteArrayResource resource = new ByteArrayResource(data);

		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + allegato.getNomeFile() + "\"")
				.contentType(MediaType.parseMediaType(immagineUtil.getContentType(allegato.getPercorso())))
				.contentLength(data.length).body(resource);
	}

	@GetMapping("/issue/{idIssue}")
	@Transactional(readOnly = true)
	public List<Allegato> getAllegatiByIssue(@PathVariable(value = "idIssue") Integer idIssue) {
		if (!issueDAO.existsById(idIssue)) {
			throw new NotFoundException("Issue non trovata con id: " + idIssue);
		}

		return allegatoDAO.findByIssueIdIssue(idIssue);
	}

	@GetMapping("/issue/{idIssue}/ordinati-dimensione")
	@Transactional(readOnly = true)
	public List<Allegato> getAllegatiOrderByDimensione(@PathVariable(value = "idIssue") Integer idIssue) {
		if (!issueDAO.existsById(idIssue)) {
			throw new NotFoundException("Issue non trovata con id: " + idIssue);
		}
		return allegatoDAO.findAllegatiByIssueOrderByDimensioneDesc(idIssue);
	}

	@GetMapping("/issue/{idIssue}/dimensione-totale")
	@Transactional(readOnly = true)
	public Map<String, Object> getDimensioneTotale(@PathVariable(value = "idIssue") Integer idIssue) {
		if (!issueDAO.existsById(idIssue)) {
			throw new NotFoundException("Issue non trovata con id: " + idIssue);
		}
		Long totale = Optional.ofNullable(allegatoDAO.sumDimensioniByIssue(idIssue)).orElse(0L);

		return Map.of("idIssue", idIssue, "dimensioneTotaleBytes", totale, "dimensioneTotaleMB",
				totale / (1024.0 * 1024.0));
	}

	@GetMapping("/issue/{idIssue}/count")
	@Transactional(readOnly = true)
	public Map<String, Object> countAllegati(@PathVariable(value = "idIssue") Integer idIssue) {
		if (!issueDAO.existsById(idIssue)) {
			throw new NotFoundException("Issue non trovata con id: " + idIssue);
		}

		long count = allegatoDAO.countByIssueIdIssue(idIssue);

		return Map.of("idIssue", idIssue, "numeroAllegati", count);
	}

	@DeleteMapping("/{id}")
	@Transactional
	public Map<String, String> eliminaAllegato(@PathVariable(value = "id") Integer id) throws IOException {
		Allegato allegato = allegatoDAO.findById(id)
				.orElseThrow(() -> new NotFoundException("Allegato non trovato con id: " + id));

		immagineUtil.deleteImmagine(allegato.getPercorso());
		allegatoDAO.delete(allegato);

		return Map.of(MESSAGE_KEY, "Allegato eliminato con successo");
	}
}