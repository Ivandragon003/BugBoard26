package it.unina.bugboard.controller;

<<<<<<< Updated upstream
import it.unina.bugboard.dao.IssueDAO;

=======
import it.unina.bugboard.dao.AllegatoDAO;
import it.unina.bugboard.dao.IssueDAO;
>>>>>>> Stashed changes
import it.unina.bugboard.dao.UtenzaDAO;
import it.unina.bugboard.exception.*;
import it.unina.bugboard.model.*;
import it.unina.bugboard.util.ImmagineUtil;
import org.springframework.beans.factory.annotation.Autowired;
<<<<<<< Updated upstream
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
=======
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
>>>>>>> Stashed changes

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/issue")
public class IssueController {

	@Autowired
	private IssueDAO issueDAO;

	@Autowired
<<<<<<< Updated upstream
	private UtenzaDAO utenzaDAO;

	@PostMapping("/crea")
	public Issue creaIssue(@RequestBody Map<String, Object> payload) {
		String titolo = (String) payload.get("titolo");
		String descrizione = (String) payload.get("descrizione");
		String prioritaStr = (String) payload.get("priorita");
		String statoStr = (String) payload.get("stato");
		String tipoStr = (String) payload.get("tipo");
		Integer idCreatore = (Integer) payload.get("idCreatore");

		if (titolo == null || titolo.isBlank()) {
			throw new InvalidInputException("Il titolo è obbligatorio");
		}

		issueDAO.findByTitolo(titolo).ifPresent(i -> {
			throw new AlreadyExistsException("Esiste già un'issue con questo titolo");
		});

		Priorita priorita = parsePriorita(prioritaStr);
		Stato stato = parseStato(statoStr);
		Tipo tipo = parseTipo(tipoStr);

		Utenza creatore = utenzaDAO.findById(idCreatore)
				.orElseThrow(() -> new NotFoundException("Utente non trovato con id: " + idCreatore));

		Issue issue = new Issue(titolo, descrizione, priorita, stato, tipo, creatore);
		return issueDAO.save(issue);
	}

	@PutMapping("/modifica/{id}")
	@Transactional // ✅ AGGIUNTO
	public Issue modificaIssue(@PathVariable Integer id, @RequestBody Map<String, Object> payload) {
		Issue issue = issueDAO.findById(id).orElseThrow(() -> new NotFoundException("Issue non trovata con id: " + id));

		// Verifica che l'issue non sia archiviata
		if (issue.getArchiviata()) {
			throw new InvalidInputException("Non è possibile modificare un'issue archiviata");
		}

		if (payload.containsKey("titolo"))
			issue.setTitolo((String) payload.get("titolo"));

		if (payload.containsKey("descrizione"))
			issue.setDescrizione((String) payload.get("descrizione"));

		if (payload.containsKey("priorita"))
			issue.setPriorita(parsePriorita((String) payload.get("priorita")));

		if (payload.containsKey("tipo"))
			issue.setTipo(parseTipo((String) payload.get("tipo")));

		// Gestione cambio stato con validazione del flusso
		if (payload.containsKey("stato")) {
			Stato nuovoStato = parseStato((String) payload.get("stato"));
			Stato statoAttuale = issue.getStato();

			// Validazione del flusso: Todo -> inProgress -> Done
			if (statoAttuale == Stato.Todo && nuovoStato == Stato.Done) {
				throw new InvalidInputException(
						"Non puoi passare direttamente da Todo a Done. Devi prima passare per In Progress.");
			}

			issue.setStato(nuovoStato);

			// Imposta dataRisoluzione quando lo stato diventa Done
			if (nuovoStato == Stato.Done && issue.getDataRisoluzione() == null) {
				issue.setDataRisoluzione(LocalDateTime.now());
			}
		}

		issue.setDataUltimaModifica(LocalDateTime.now());
		return issueDAO.save(issue);
	}

	@GetMapping("/filtra")
	public List<Issue> filtraIssue(@RequestParam(required = false) String stato,
			@RequestParam(required = false) String priorita, @RequestParam(required = false) String tipo) {

		if (stato != null && priorita != null)
			return issueDAO.findByStatoAndPriorita(parseStato(stato), parsePriorita(priorita));

		if (stato != null)
			return issueDAO.findByStato(parseStato(stato));

		if (priorita != null)
			return issueDAO.findByPriorita(parsePriorita(priorita));

		if (tipo != null)
			return issueDAO.findByTipo(parseTipo(tipo));

		return issueDAO.findAll();
	}

	@DeleteMapping("/archivia/{id}")
	public Map<String, String> archiviaIssue(@PathVariable Integer id, @RequestParam Integer idArchiviatore) {
		Issue issue = issueDAO.findById(id).orElseThrow(() -> new NotFoundException("Issue non trovata con id: " + id));

		if (issue.getArchiviata())
			throw new InvalidInputException("L'issue è già archiviata");

		issue.setArchiviata(true);
		issue.setDataArchiviazione(LocalDateTime.now());

		Utenza archiviatore = utenzaDAO.findById(idArchiviatore)
				.orElseThrow(() -> new NotFoundException("Utente non trovato con id: " + idArchiviatore));

		issue.setArchiviatore(archiviatore);
		issueDAO.save(issue);

		return Map.of("message", "Issue archiviata con successo");
	}

	@PutMapping("/disarchivia/{id}")
	public Map<String, String> disarchiviaIssue(@PathVariable Integer id) {
		Issue issue = issueDAO.findById(id).orElseThrow(() -> new NotFoundException("Issue non trovata con id: " + id));

		if (!issue.getArchiviata())
			throw new InvalidInputException("L'issue non è archiviata");

		issue.setArchiviata(false);
		issue.setDataArchiviazione(null);
		issue.setArchiviatore(null);

		issueDAO.save(issue);
		return Map.of("message", "Issue disarchiviata con successo");
	}

	@GetMapping("/ordina")
	public List<Issue> ordinaIssue() {
		return issueDAO.findAllByOrderByDataUltimaModificaDesc();
	}

	@GetMapping("/visualizza/{id}")
	public Issue visualizzaIssue(@PathVariable Integer id) {
		return issueDAO.findById(id).orElseThrow(() -> new NotFoundException("Issue non trovata con id: " + id));
	}

	@DeleteMapping("/elimina/{id}")
	@Transactional
	public Map<String, String> eliminaIssue(@PathVariable Integer id) {
		Issue issue = issueDAO.findById(id).orElseThrow(() -> new NotFoundException("Issue non trovata con id: " + id));

		issueDAO.delete(issue);

		return Map.of("message", "Issue eliminata con successo");
	}

	@GetMapping("/visualizza-lista")
	public List<Issue> visualizzaListaIssue(@RequestParam(required = false) Boolean archiviata) {
		return archiviata != null ? issueDAO.findByArchiviata(archiviata) : issueDAO.findAll();
	}

	@GetMapping("/urgenti")
	public List<Issue> trovaUrgenti() {
		return issueDAO.findIssueUrgenti(List.of(Priorita.critical, Priorita.high));
	}

	@GetMapping("/cerca")
	public List<Issue> cercaIssue(@RequestParam String titolo) {
		return issueDAO.findByTitoloContainingIgnoreCase(titolo);
	}

	@GetMapping("/statistiche")
	public Map<String, Object> visualizzaStatistiche() {
		Map<String, Object> stats = new HashMap<>();
		stats.put("totali", issueDAO.count());
		stats.put("attive", issueDAO.countByArchiviataFalse());
=======
	private AllegatoDAO allegatoDAO;

	@Autowired
	private UtenzaDAO utenzaDAO;

	@Autowired
	private ImmagineUtil immagineUtil;

// --- CREAZIONE ISSUE ---
	@PostMapping("/crea")
	public ResponseEntity<Issue> creaIssue(@RequestBody Map<String, Object> payload) {
		String titolo = (String) payload.get("titolo");
		String descrizione = (String) payload.get("descrizione");
		String prioritaStr = (String) payload.get("priorita");
		String tipoStr = (String) payload.get("tipo");
		Integer idCreatore = (Integer) payload.get("idCreatore");

		if (titolo == null || titolo.isBlank() || titolo.length() > 200) {
			throw new InvalidInputException("Titolo obbligatorio, max 200 caratteri");
		}
		if (descrizione == null || descrizione.isBlank() || descrizione.length() > 5000) {
			throw new InvalidInputException("Descrizione obbligatoria, max 5000 caratteri");
		}

		issueDAO.findByTitolo(titolo).ifPresent(i -> {
			throw new AlreadyExistsException("Esiste già un'issue con questo titolo");
		});

		Priorita priorita = parsePriorita(prioritaStr);
		Tipo tipo = parseTipo(tipoStr);

		Utenza creatore = utenzaDAO.findById(idCreatore)
				.orElseThrow(() -> new NotFoundException("Utente non trovato con id: " + idCreatore));

		Stato statoIniziale = Stato.Todo;

		Issue issue = new Issue(titolo, descrizione, priorita, statoIniziale, tipo, creatore);
		issue.setDataCreazione(LocalDateTime.now());
		Issue saved = issueDAO.save(issue);
		return ResponseEntity.status(HttpStatus.CREATED).body(saved);
	}

// --- MODIFICA ISSUE ---
	@PutMapping("/modifica/{id}")
	public ResponseEntity<Issue> modificaIssue(@PathVariable Integer id, @RequestBody Map<String, Object> payload) {
		Issue issue = issueDAO.findById(id).orElseThrow(() -> new NotFoundException("Issue non trovata con id: " + id));

		Integer idUtenteModificatore = (Integer) payload.get("idUtenteModificatore");
		if (idUtenteModificatore == null)
			throw new InvalidInputException("idUtenteModificatore obbligatorio");

		Utenza utenteModificatore = utenzaDAO.findById(idUtenteModificatore)
				.orElseThrow(() -> new NotFoundException("Utente non trovato con id: " + idUtenteModificatore));

		boolean isCreatore = issue.getCreatore().getIdUtente().equals(idUtenteModificatore);
		boolean isAssegnato = issue.getUtentiAssegnati().stream()
				.anyMatch(u -> u.getIdUtente().equals(idUtenteModificatore));
		boolean isAmministratore = utenteModificatore.getRuolo() == Ruolo.Amministratore;

		if (issue.getStato() == Stato.Done && !isAmministratore)
			throw new UnauthorizedException("Non è possibile modificare un'issue in stato Done");
		if (!isCreatore && !isAssegnato && !isAmministratore)
			throw new UnauthorizedException("Permessi insufficienti per modificare l'issue");

		if (payload.containsKey("titolo")) {
			String nuovoTitolo = (String) payload.get("titolo");
			if (!nuovoTitolo.equals(issue.getTitolo())) {
				issueDAO.findByTitolo(nuovoTitolo).ifPresent(i -> {
					throw new AlreadyExistsException("Esiste già un'issue con questo titolo");
				});
			}
			issue.setTitolo(nuovoTitolo);
		}
		if (payload.containsKey("descrizione"))
			issue.setDescrizione((String) payload.get("descrizione"));
		if (payload.containsKey("priorita"))
			issue.setPriorita(parsePriorita((String) payload.get("priorita")));

		if (payload.containsKey("stato")) {
			Stato nuovoStato = parseStato((String) payload.get("stato"));
			if (!isAmministratore) {
				if (issue.getStato() == Stato.Todo && nuovoStato != Stato.inProgress && nuovoStato != Stato.Todo)
					throw new InvalidInputException("Transizione non valida da Todo");
				if (issue.getStato() == Stato.inProgress && nuovoStato != Stato.Done && nuovoStato != Stato.inProgress)
					throw new InvalidInputException("Transizione non valida da In Progress");
			}
			issue.setStato(nuovoStato);
			if (nuovoStato == Stato.Done && issue.getDataRisoluzione() == null)
				issue.setDataRisoluzione(LocalDateTime.now());
		}

		if (payload.containsKey("tipo")) {
			String tipoPayload = (String) payload.get("tipo");
			if (!tipoPayload.equalsIgnoreCase(issue.getTipo().name()))
				throw new InvalidInputException("Il tipo non può essere modificato");
		}

		issue.setDataUltimaModifica(LocalDateTime.now());
		Issue updated = issueDAO.save(issue);
		return ResponseEntity.ok(updated);
	}

// --- ARCHIVIA / DISARCHIVIA ISSUE ---
	@PutMapping("/archivia/{id}")
	public ResponseEntity<Map<String, String>> archiviaIssue(@PathVariable Integer id,
			@RequestParam Integer idArchiviatore) {
		Issue issue = issueDAO.findById(id).orElseThrow(() -> new NotFoundException("Issue non trovata con id: " + id));
		Utenza archiviatore = utenzaDAO.findById(idArchiviatore)
				.orElseThrow(() -> new NotFoundException("Utente non trovato con id: " + idArchiviatore));

		if (archiviatore.getRuolo() != Ruolo.Amministratore)
			throw new UnauthorizedException("Solo un amministratore può archiviare un'issue");
		if (issue.getArchiviata())
			throw new InvalidInputException("L'issue è già archiviata");

		issue.setArchiviata(true);
		issue.setDataArchiviazione(LocalDateTime.now());
		issue.setArchiviatore(archiviatore);
		issueDAO.save(issue);

		return ResponseEntity.ok(Map.of("message", "Issue archiviata con successo"));
	}

	@PutMapping("/disarchivia/{id}")
	public ResponseEntity<Map<String, String>> disarchiviaIssue(@PathVariable Integer id,
			@RequestParam Integer idAmministratore) {
		Issue issue = issueDAO.findById(id).orElseThrow(() -> new NotFoundException("Issue non trovata con id: " + id));
		Utenza amministratore = utenzaDAO.findById(idAmministratore)
				.orElseThrow(() -> new NotFoundException("Utente non trovato con id: " + idAmministratore));

		if (amministratore.getRuolo() != Ruolo.Amministratore)
			throw new UnauthorizedException("Solo un amministratore può disarchiviare un'issue");
		if (!issue.getArchiviata())
			throw new InvalidInputException("L'issue non è archiviata");

		issue.setArchiviata(false);
		issue.setDataArchiviazione(null);
		issue.setArchiviatore(null);
		issue.setDataUltimaModifica(LocalDateTime.now());
		issueDAO.save(issue);

		return ResponseEntity.ok(Map.of("message", "Issue disarchiviata con successo"));
	}

// --- ELIMINAZIONE ISSUE ---
	@DeleteMapping("/elimina/{id}")
	@Transactional
	public ResponseEntity<Map<String, String>> eliminaIssue(@PathVariable Integer id, @RequestParam Integer idUtente) {
		Issue issue = issueDAO.findById(id).orElseThrow(() -> new NotFoundException("Issue non trovata con id: " + id));
		Utenza utente = utenzaDAO.findById(idUtente)
				.orElseThrow(() -> new NotFoundException("Utente non trovato con id: " + idUtente));

		boolean isCreatore = issue.getCreatore().getIdUtente().equals(idUtente);
		boolean isAmministratore = utente.getRuolo() == Ruolo.Amministratore;

		if (!isCreatore && !isAmministratore)
			throw new UnauthorizedException("Solo creatore o amministratore possono eliminare l'issue");
		if (issue.getArchiviata() && !isAmministratore)
			throw new UnauthorizedException("Non è possibile eliminare un'issue archiviata");

		// Elimina allegati
		List<Allegato> allegati = allegatoDAO.findByIssueIdIssue(id);
		for (Allegato allegato : allegati) {
			try {
				immagineUtil.deleteImmagine(allegato.getPercorso());
			} catch (Exception e) {
				System.err.println("Errore eliminazione file: " + e.getMessage());
			}
		}
		allegatoDAO.deleteByIssueIdIssue(id);

		// Elimina issue
		issueDAO.deleteById(id);
		return ResponseEntity.ok(Map.of("message", "Issue eliminata con successo"));
	}

// --- GESTIONE ALLEGATI ---
	@PostMapping("/upload-allegato")
	public ResponseEntity<Allegato> uploadAllegato(@RequestParam("file") MultipartFile file,
			@RequestParam("idIssue") Integer idIssue) {

		Issue issue = issueDAO.findById(idIssue)
				.orElseThrow(() -> new NotFoundException("Issue non trovata con id: " + idIssue));

		if (file == null || file.isEmpty())
			throw new InvalidInputException("File mancante o vuoto");
		if (!immagineUtil.isSupported(file))
			throw new InvalidInputException("Formato file non supportato");

		String percorso = immagineUtil.uploadImmagine(file);
		Allegato allegato = new Allegato(percorso, file.getOriginalFilename(), file.getContentType(),
				(int) file.getSize(), issue);
		Allegato saved = allegatoDAO.save(allegato);
		return ResponseEntity.status(HttpStatus.CREATED).body(saved);
	}

// --- FILTRI E ORDINAMENTO ---
	@GetMapping("/filtra")
	public ResponseEntity<List<Issue>> filtraIssue(@RequestParam(required = false) String stato,
			@RequestParam(required = false) String priorita, @RequestParam(required = false) String tipo) {

		List<Issue> issues;
		if (stato != null && priorita != null)
			issues = issueDAO.findByStatoAndPriorita(parseStato(stato), parsePriorita(priorita));
		else if (stato != null)
			issues = issueDAO.findByStato(parseStato(stato));
		else if (priorita != null)
			issues = issueDAO.findByPriorita(parsePriorita(priorita));
		else if (tipo != null)
			issues = issueDAO.findByTipo(parseTipo(tipo));
		else
			issues = issueDAO.findAll();

		return ResponseEntity.ok(issues);
	}

	@GetMapping("/ordina")
	public ResponseEntity<List<Issue>> ordinaIssue() {
		return ResponseEntity.ok(issueDAO.findAllByOrderByDataUltimaModificaDesc());
	}

	@GetMapping("/visualizza-lista")
	public ResponseEntity<List<Issue>> visualizzaListaIssue(@RequestParam(required = false) Boolean archiviata) {
		List<Issue> issues = archiviata != null ? issueDAO.findByArchiviata(archiviata) : issueDAO.findAll();
		return ResponseEntity.ok(issues);
	}

	@GetMapping("/cerca")
	public ResponseEntity<List<Issue>> cercaIssue(@RequestParam String titolo) {
		if (titolo == null || titolo.isBlank())
			throw new InvalidInputException("Parametro 'titolo' non può essere vuoto");
		return ResponseEntity.ok(issueDAO.findByTitoloContainingIgnoreCase(titolo));
	}

// --- STATISTICHE ---
	@GetMapping("/statistiche")
	public ResponseEntity<Map<String, Object>> visualizzaStatistiche() {
		Map<String, Object> stats = new HashMap<>();
		stats.put("totali", issueDAO.count());
		stats.put("attive", issueDAO.countByArchiviataFalse());
		stats.put("archiviate", issueDAO.count() - issueDAO.countByArchiviataFalse());
>>>>>>> Stashed changes
		stats.put("todo", issueDAO.countByStato(Stato.Todo));
		stats.put("inProgress", issueDAO.countByStato(Stato.inProgress));
		stats.put("done", issueDAO.countByStato(Stato.Done));
		stats.put("risolte", issueDAO.findIssueRisolte().size());
		stats.put("nonRisolte", issueDAO.findIssueNonRisolte().size());
<<<<<<< Updated upstream
		return stats;
	}

	// ✅ NUOVO: Endpoint per assegnare utenti alle issue
	@PostMapping("/{idIssue}/assegna/{idUtente}")
	@Transactional
	public Issue assegnaUtente(@PathVariable Integer idIssue, @PathVariable Integer idUtente) {
		Issue issue = issueDAO.findById(idIssue)
				.orElseThrow(() -> new NotFoundException("Issue non trovata con id: " + idIssue));

		Utenza utente = utenzaDAO.findById(idUtente)
				.orElseThrow(() -> new NotFoundException("Utente non trovato con id: " + idUtente));

		if (!issue.getUtentiAssegnati().contains(utente)) {
			issue.getUtentiAssegnati().add(utente);
			issueDAO.save(issue);
		}

		return issue;
	}

	// ✅ NUOVO: Endpoint per rimuovere assegnazione utente
	@DeleteMapping("/{idIssue}/rimuovi-assegnazione/{idUtente}")
	@Transactional
	public Issue rimuoviAssegnazione(@PathVariable Integer idIssue, @PathVariable Integer idUtente) {
		Issue issue = issueDAO.findById(idIssue)
				.orElseThrow(() -> new NotFoundException("Issue non trovata con id: " + idIssue));

		issue.getUtentiAssegnati().removeIf(u -> u.getIdUtente().equals(idUtente));
		return issueDAO.save(issue);
	}

	// ✅ NUOVO: Endpoint per ottenere gli utenti assegnati a un'issue
	@GetMapping("/{idIssue}/utenti-assegnati")
	public List<Utenza> getUtentiAssegnati(@PathVariable Integer idIssue) {
		Issue issue = issueDAO.findById(idIssue)
				.orElseThrow(() -> new NotFoundException("Issue non trovata con id: " + idIssue));

		return issue.getUtentiAssegnati();
	}

	private Priorita parsePriorita(String value) {
		if (value == null || value.isBlank()) {
			return Priorita.none;
		}

		return switch (value.toLowerCase()) {
		case "none" -> Priorita.none;
=======
		return ResponseEntity.ok(stats);
	}

// --- HELPERS ---
	private Priorita parsePriorita(String value) {
		if (value == null)
			throw new InvalidInputException("Priorità non può essere null");
		return switch (value.toLowerCase()) {
>>>>>>> Stashed changes
		case "critical" -> Priorita.critical;
		case "high" -> Priorita.high;
		case "medium" -> Priorita.medium;
		case "low" -> Priorita.low;
		default -> throw new InvalidInputException("Priorità non valida: " + value);
		};
	}

	private Stato parseStato(String value) {
		if (value == null)
			throw new InvalidInputException("Stato non può essere null");
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
		return switch (value.toLowerCase()) {
		case "todo" -> Stato.Todo;
		case "inprogress", "in_progress" -> Stato.inProgress;
		case "done" -> Stato.Done;
		default -> throw new InvalidInputException("Stato non valido: " + value);
		};
	}

	private Tipo parseTipo(String value) {
		if (value == null)
			throw new InvalidInputException("Tipo non può essere null");
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
		return switch (value.toLowerCase()) {
		case "question" -> Tipo.question;
		case "features" -> Tipo.features;
		case "bug" -> Tipo.bug;
		case "documentation" -> Tipo.documentation;
		default -> throw new InvalidInputException("Tipo non valido: " + value);
		};
	}
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
}
