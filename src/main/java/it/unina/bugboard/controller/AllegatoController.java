package it.unina.bugboard.controller;

import it.unina.bugboard.dao.AllegatoDAO;
import it.unina.bugboard.dao.IssueDAO;
import it.unina.bugboard.model.Allegato;
import it.unina.bugboard.model.Issue;
import it.unina.bugboard.exception.*;
import it.unina.bugboard.util.ImmagineUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/allegato")
@CrossOrigin(origins = "*")
public class AllegatoController {

	@Autowired
	private AllegatoDAO allegatoDAO;

	@Autowired
	private IssueDAO issueDAO;

	@Autowired
	private ImmagineUtil immagineUtil;

	@PostMapping("/upload")
	public Allegato uploadAllegato(@RequestParam("file") MultipartFile file, @RequestParam("idIssue") Integer idIssue) {

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
	public ResponseEntity<ByteArrayResource> downloadAllegato(@PathVariable Integer id) {
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
	public List<Allegato> getAllegatiByIssue(@PathVariable Integer idIssue) {
		if (!issueDAO.existsById(idIssue)) {
			throw new NotFoundException("Issue non trovata con id: " + idIssue);
		}
		return allegatoDAO.findByIssueIdIssue(idIssue);
	}

	@GetMapping("/issue/{idIssue}/ordinati-dimensione")
	public List<Allegato> getAllegatiOrderByDimensione(@PathVariable Integer idIssue) {
		if (!issueDAO.existsById(idIssue)) {
			throw new NotFoundException("Issue non trovata con id: " + idIssue);
		}
		return allegatoDAO.findAllegatiByIssueOrderByDimensioneDesc(idIssue);
	}

	@GetMapping("/issue/{idIssue}/dimensione-totale")
	public Map<String, Object> getDimensioneTotale(@PathVariable Integer idIssue) {
		if (!issueDAO.existsById(idIssue)) {
			throw new NotFoundException("Issue non trovata con id: " + idIssue);
		}
		Long totale = Optional.ofNullable(allegatoDAO.sumDimensioniByIssue(idIssue)).orElse(0L);

		return Map.of("idIssue", idIssue, "dimensioneTotaleBytes", totale, "dimensioneTotaleMB",
				totale / (1024.0 * 1024.0));
	}

	@GetMapping("/issue/{idIssue}/count")
	public Map<String, Object> countAllegati(@PathVariable Integer idIssue) {
		if (!issueDAO.existsById(idIssue)) {
			throw new NotFoundException("Issue non trovata con id: " + idIssue);
		}
		return Map.of("idIssue", idIssue, "numeroAllegati", allegatoDAO.countByIssueIdIssue(idIssue));
	}

	@DeleteMapping("/{id}")
	@Transactional
	public Map<String, String> eliminaAllegato(@PathVariable Integer id) {
		Allegato allegato = allegatoDAO.findById(id)
				.orElseThrow(() -> new NotFoundException("Allegato non trovato con id: " + id));

		immagineUtil.deleteImmagine(allegato.getPercorso());
		allegatoDAO.delete(allegato);

		return Map.of("message", "Allegato eliminato con successo");
	}

}
