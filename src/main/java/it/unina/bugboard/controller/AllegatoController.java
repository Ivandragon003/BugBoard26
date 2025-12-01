package it.unina.bugboard.controller;

import it.unina.bugboard.dao.AllegatoDAO;
import it.unina.bugboard.dao.IssueDAO;
import it.unina.bugboard.model.Allegato;
import it.unina.bugboard.model.Issue;
import it.unina.bugboard.exception.*;
import it.unina.bugboard.util.ImmagineUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/allegato")
public class AllegatoController {

	private static final Logger logger = LoggerFactory.getLogger(AllegatoController.class);

	@Autowired
	private AllegatoDAO allegatoDAO;

	@Autowired
	private IssueDAO issueDAO;

	@Autowired
	private ImmagineUtil immagineUtil;

	@PostMapping("/upload")
	@Transactional
	public Allegato uploadAllegato(@RequestParam("file") MultipartFile file, @RequestParam("idIssue") Integer idIssue) {
		try {
			logger.info("========================================");
			logger.info("🔵 POST /api/allegato/upload");
			logger.info("📊 idIssue: {}", idIssue);
			logger.info("📊 File: {} - Size: {} bytes - Type: {}", 
				file.getOriginalFilename(), file.getSize(), file.getContentType());
			logger.info("========================================");

			// 1. Verifica Issue
			logger.info("1️⃣ Ricerca Issue con ID: {}", idIssue);
			Issue issue = issueDAO.findById(idIssue)
					.orElseThrow(() -> {
						logger.error("❌ Issue non trovata con id: {}", idIssue);
						return new NotFoundException("Issue non trovata con id: " + idIssue);
					});
			logger.info("✅ Issue trovata: {}", issue.getTitolo());

			// 2. Validazione File
			if (file == null || file.isEmpty()) {
				logger.error("❌ File mancante o vuoto");
				throw new InvalidInputException("File mancante o vuoto");
			}
			logger.info("✅ File valido");

			// 3. Upload File
			logger.info("2️⃣ Inizio upload file tramite ImmagineUtil...");
			String percorso = immagineUtil.uploadImmagine(file);
			logger.info("✅ File uploadato. Percorso: {}", percorso);

			// 4. Creazione Allegato
			logger.info("3️⃣ Creazione oggetto Allegato...");
			Allegato allegato = new Allegato(
				percorso, 
				file.getOriginalFilename(), 
				file.getContentType(),
				(int) file.getSize(), 
				issue
			);
			logger.info("📝 Allegato creato: {}", allegato.getNomeFile());

			// 5. Salvataggio nel DB
			logger.info("4️⃣ Salvataggio Allegato nel database...");
			Allegato savedAllegato = allegatoDAO.save(allegato);
			logger.info("✅ Allegato salvato con ID: {}", savedAllegato.getIdAllegato());
			
			// 6. Verifica finale
			if (savedAllegato.getIdAllegato() != null) {
				logger.info("✅✅✅ SUCCESSO COMPLETO ✅✅✅");
				logger.info("📍 ID Allegato: {}", savedAllegato.getIdAllegato());
				logger.info("📍 Nome File: {}", savedAllegato.getNomeFile());
				logger.info("📍 Percorso: {}", savedAllegato.getPercorso());
				logger.info("📍 Dimensione: {} bytes", savedAllegato.getDimensione());
			} else {
				logger.error("❌❌❌ ERRORE: Allegato salvato ma senza ID!");
			}
			
			logger.info("========================================\n");

			return savedAllegato;
			
		} catch (Exception e) {
			logger.error("❌❌❌ ECCEZIONE CATTURATA ❌❌❌");
			logger.error("Tipo: {}", e.getClass().getName());
			logger.error("Messaggio: {}", e.getMessage());
			logger.error("Stack trace:", e);
			logger.info("========================================\n");
			throw e;
		}
	}

	@GetMapping("/download/{id}")
	public ResponseEntity<ByteArrayResource> downloadAllegato(@PathVariable Integer id) {
		logger.info("📥 GET /api/allegato/download/{}", id);
		
		Allegato allegato = allegatoDAO.findById(id)
				.orElseThrow(() -> {
					logger.error("❌ Allegato non trovato con id: {}", id);
					return new NotFoundException("Allegato non trovato con id: " + id);
				});

		logger.info("✅ Allegato trovato: {}", allegato.getNomeFile());
		logger.info("📁 Percorso: {}", allegato.getPercorso());

		byte[] data = immagineUtil.getImageBytes(allegato.getPercorso());
		ByteArrayResource resource = new ByteArrayResource(data);

		logger.info("✅ Download completato: {} bytes", data.length);

		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + allegato.getNomeFile() + "\"")
				.contentType(MediaType.parseMediaType(immagineUtil.getContentType(allegato.getPercorso())))
				.contentLength(data.length).body(resource);
	}

	@GetMapping("/issue/{idIssue}")
	public List<Allegato> getAllegatiByIssue(@PathVariable Integer idIssue) {
		logger.info("📋 GET /api/allegato/issue/{}", idIssue);
		
		if (!issueDAO.existsById(idIssue)) {
			logger.error("❌ Issue non trovata con id: {}", idIssue);
			throw new NotFoundException("Issue non trovata con id: " + idIssue);
		}
		
		List<Allegato> allegati = allegatoDAO.findByIssueIdIssue(idIssue);
		logger.info("✅ Trovati {} allegati per issue #{}", allegati.size(), idIssue);
		
		return allegati;
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
		logger.info("🔢 GET /api/allegato/issue/{}/count", idIssue);
		
		if (!issueDAO.existsById(idIssue)) {
			throw new NotFoundException("Issue non trovata con id: " + idIssue);
		}
		
		long count = allegatoDAO.countByIssueIdIssue(idIssue);
		logger.info("✅ Issue #{} ha {} allegati", idIssue, count);
		
		return Map.of("idIssue", idIssue, "numeroAllegati", count);
	}

	@DeleteMapping("/{id}")
	@Transactional
	public Map<String, String> eliminaAllegato(@PathVariable Integer id) {
		logger.info("🗑️ DELETE /api/allegato/{}", id);
		
		Allegato allegato = allegatoDAO.findById(id)
				.orElseThrow(() -> {
					logger.error("❌ Allegato non trovato con id: {}", id);
					return new NotFoundException("Allegato non trovato con id: " + id);
				});

		logger.info("📁 Eliminazione file: {}", allegato.getPercorso());
		immagineUtil.deleteImmagine(allegato.getPercorso());
		
		logger.info("🗄️ Eliminazione record dal DB");
		allegatoDAO.delete(allegato);
		
		logger.info("✅ Allegato eliminato con successo");

		return Map.of("message", "Allegato eliminato con successo");
	}
}