package it.unina.bugboard.controller;

import it.unina.bugboard.dao.IssueDAO;
import it.unina.bugboard.dao.TeamDAO;
import it.unina.bugboard.dao.UtenzaDAO;
import it.unina.bugboard.model.*;
import it.unina.bugboard.exception.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/issue")
public class IssueController {

	@Autowired
	private IssueDAO issueDAO;

	@Autowired
	private UtenzaDAO utenzaDAO;

	@Autowired
	private TeamDAO teamDAO;

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
	@Transactional
	public Issue modificaIssue(@PathVariable Integer id, @RequestBody Map<String, Object> payload) {
		Issue issue = issueDAO.findById(id).orElseThrow(() -> new NotFoundException("Issue non trovata con id: " + id));

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

		if (payload.containsKey("stato")) {
			Stato nuovoStato = parseStato((String) payload.get("stato"));
			Stato statoAttuale = issue.getStato();

			if (statoAttuale == Stato.Todo && nuovoStato == Stato.Done) {
				throw new InvalidInputException(
						"Non puoi passare direttamente da Todo a Done. Devi prima passare per In Progress.");
			}

			issue.setStato(nuovoStato);

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
		stats.put("todo", issueDAO.countByStato(Stato.Todo));
		stats.put("inProgress", issueDAO.countByStato(Stato.inProgress));
		stats.put("done", issueDAO.countByStato(Stato.Done));
		stats.put("risolte", issueDAO.findIssueRisolte().size());
		stats.put("nonRisolte", issueDAO.findIssueNonRisolte().size());
		return stats;
	}

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

	@DeleteMapping("/{idIssue}/rimuovi-assegnazione/{idUtente}")
	@Transactional
	public Issue rimuoviAssegnazione(@PathVariable Integer idIssue, @PathVariable Integer idUtente) {
		Issue issue = issueDAO.findById(idIssue)
				.orElseThrow(() -> new NotFoundException("Issue non trovata con id: " + idIssue));

		issue.getUtentiAssegnati().removeIf(u -> u.getIdUtente().equals(idUtente));
		return issueDAO.save(issue);
	}

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

		return switch (value.toLowerCase()) {
		case "question" -> Tipo.question;
		case "features" -> Tipo.features;
		case "bug" -> Tipo.bug;
		case "documentation" -> Tipo.documentation;
		default -> throw new InvalidInputException("Tipo non valido: " + value);
		};
	}

	// ---------------- ASSEGNA ISSUE A TEAM ----------------
	@PutMapping("/{idIssue}/assegna-team/{idTeam}")
	@Transactional
	public Issue assegnaIssueATeam(@PathVariable Integer idIssue, @PathVariable Integer idTeam) {
		Issue issue = issueDAO.findById(idIssue)
				.orElseThrow(() -> new NotFoundException("Issue non trovata con id: " + idIssue));

		Team team = teamDAO.findById(idTeam)
				.orElseThrow(() -> new NotFoundException("Team non trovato con id: " + idTeam));

		if (!team.getAttivo()) {
			throw new InvalidInputException("Non è possibile assegnare issue a un team disattivato");
		}

		issue.setTeam(team);
		return issueDAO.save(issue);
	}

	// ---------------- RIMUOVI ISSUE DA TEAM ----------------
	@DeleteMapping("/{idIssue}/rimuovi-team")
	@Transactional
	public Issue rimuoviIssueDaTeam(@PathVariable Integer idIssue) {
		Issue issue = issueDAO.findById(idIssue)
				.orElseThrow(() -> new NotFoundException("Issue non trovata con id: " + idIssue));

		issue.setTeam(null);
		return issueDAO.save(issue);
	}

	// ---------------- VISUALIZZA ISSUE DI UN TEAM ----------------
	@GetMapping("/team/{idTeam}")
	public List<Issue> getIssuesByTeam(@PathVariable Integer idTeam) {
		Team team = teamDAO.findById(idTeam)
				.orElseThrow(() -> new NotFoundException("Team non trovato con id: " + idTeam));

		return issueDAO.findByTeam(team);
	}

	// ---------------- VISUALIZZA ISSUE DI UN TEAM PER STATO ----------------
	@GetMapping("/team/{idTeam}/stato/{stato}")
	public List<Issue> getIssuesByTeamAndStato(@PathVariable Integer idTeam, @PathVariable String stato) {
		Team team = teamDAO.findById(idTeam)
				.orElseThrow(() -> new NotFoundException("Team non trovato con id: " + idTeam));

		Stato statoEnum = parseStato(stato);
		return issueDAO.findByTeamAndStato(team, statoEnum);
	}
}