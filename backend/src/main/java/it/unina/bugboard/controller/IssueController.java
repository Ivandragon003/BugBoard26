package it.unina.bugboard.controller;

import it.unina.bugboard.dao.IssueDAO;
import it.unina.bugboard.dao.UtenzaDAO;
import it.unina.bugboard.model.*;
import it.unina.bugboard.exception.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/issue")
@Transactional(readOnly = true)
public class IssueController {

	
	private static final String MESSAGE_KEY = "message";
	private static final String ISSUE_NON_TROVATA_MSG = "Issue non trovata con id: ";
	
	private final IssueDAO issueDAO;
	private final UtenzaDAO utenzaDAO;

	public IssueController(IssueDAO issueDAO, UtenzaDAO utenzaDAO) {
		this.issueDAO = issueDAO;
		this.utenzaDAO = utenzaDAO;
	}

	@PostMapping("/crea")
	@Transactional
	public Issue creaIssue(@RequestBody Map<String, Object> payload) {
		String titolo = (String) payload.get("titolo");
		String descrizione = (String) payload.get("descrizione");
		String prioritaStr = (String) payload.get("priorita");
		String statoStr = (String) payload.get("stato");
		String tipoStr = (String) payload.get("tipo");
		Integer idCreatore = (Integer) payload.get("idCreatore");

		if (titolo == null || titolo.isBlank()) {
			throw new InvalidFieldException("Il titolo è obbligatorio");
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

	@GetMapping("/filtra-avanzato")
	public List<Issue> filtraAvanzato(@RequestParam(value = "stato", required = false) String stato,
			@RequestParam(value = "priorita", required = false) String priorita,
			@RequestParam(value = "tipo", required = false) String tipo,
			@RequestParam(value = "ricerca", required = false) String ricerca,
			@RequestParam(value = "ordinamento", required = false) String ordinamento,
			@RequestParam(value = "archiviata", required = false, defaultValue = "false") boolean archiviata) {

		List<Issue> issues = archiviata ? issueDAO.findByArchiviata(true) : issueDAO.findByArchiviataFalse();

		if (stato != null && !stato.isEmpty()) {
			Stato statoEnum = parseStato(stato);
			issues = issues.stream().filter(i -> i.getStato() == statoEnum).collect(Collectors.toList());
		}

		if (priorita != null && !priorita.isEmpty()) {
			Priorita prioritaEnum = parsePriorita(priorita);
			issues = issues.stream().filter(i -> i.getPriorita() == prioritaEnum).collect(Collectors.toList());
		}

		if (tipo != null && !tipo.isEmpty()) {
			Tipo tipoEnum = parseTipo(tipo);
			issues = issues.stream().filter(i -> i.getTipo() == tipoEnum).collect(Collectors.toList());
		}

		if (ricerca != null && !ricerca.isEmpty()) {
			String ricercaLower = ricerca.toLowerCase();
			issues = issues.stream().filter(i -> i.getTitolo().toLowerCase().contains(ricercaLower))
					.collect(Collectors.toList());
		}

		if (ordinamento != null && !ordinamento.isEmpty()) {
			switch (ordinamento.toLowerCase()) {
			case "data_recente":
				issues.sort((a, b) -> b.getDataCreazione().compareTo(a.getDataCreazione()));
				break;
			case "data_vecchio":
				issues.sort((a, b) -> a.getDataCreazione().compareTo(b.getDataCreazione()));
				break;
			case "titolo_az":
				issues.sort((a, b) -> a.getTitolo().compareToIgnoreCase(b.getTitolo()));
				break;
			case "titolo_za":
				issues.sort((a, b) -> b.getTitolo().compareToIgnoreCase(a.getTitolo()));
				break;
			case "priorita_alta":
				issues.sort((a, b) -> Integer.compare(getPrioritaOrdine(a.getPriorita()),
						getPrioritaOrdine(b.getPriorita())));
				break;
			case "priorita_bassa":
				issues.sort((a, b) -> Integer.compare(getPrioritaOrdine(b.getPriorita()),
						getPrioritaOrdine(a.getPriorita())));
				break;
			default:
				issues.sort((a, b) -> b.getDataCreazione().compareTo(a.getDataCreazione()));
			}
		} else {
			issues.sort((a, b) -> b.getDataCreazione().compareTo(a.getDataCreazione()));
		}

		return issues;
	}

	@GetMapping("/filtra")
	public List<Issue> filtraIssue(@RequestParam(value = "stato", required = false) String stato,
			@RequestParam(value = "priorita", required = false) String priorita,
			@RequestParam(value = "tipo", required = false) String tipo) {

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
	@Transactional
	public Map<String, String> archiviaIssue(@PathVariable(value = "id") Integer id,
			@RequestParam(value = "idArchiviatore") Integer idArchiviatore) {
		Issue issue = issueDAO.findById(id)
				.orElseThrow(() -> new NotFoundException(ISSUE_NON_TROVATA_MSG + id));

		if (Boolean.TRUE.equals(issue.getArchiviata())) {
			throw new InvalidFieldException("L'issue è già archiviata");
		}
		issue.setArchiviata(true);
		issue.setDataArchiviazione(LocalDateTime.now());

		Utenza archiviatore = utenzaDAO.findById(idArchiviatore)
				.orElseThrow(() -> new NotFoundException("Utente non trovato con id: " + idArchiviatore));

		issue.setArchiviatore(archiviatore);
		issueDAO.save(issue);

		return Map.of(MESSAGE_KEY, "Issue archiviata con successo");
	}

	@PutMapping("/disarchivia/{id}")
	@Transactional
	public Map<String, String> disarchiviaIssue(@PathVariable(value = "id") Integer id) {
		Issue issue = issueDAO.findById(id)
				.orElseThrow(() -> new NotFoundException(ISSUE_NON_TROVATA_MSG + id));

		if (Boolean.FALSE.equals(issue.getArchiviata()))
			throw new InvalidFieldException("L'issue non è archiviata");

		issue.setArchiviata(false);
		issue.setDataArchiviazione(null);
		issue.setArchiviatore(null);

		issueDAO.save(issue);
		return Map.of(MESSAGE_KEY, "Issue disarchiviata con successo");
	}

	@PatchMapping("/{id}/stato")
	@Transactional
	public Issue cambiaStato(@PathVariable(value = "id") Integer id,
			@RequestParam(value = "nuovoStato") String nuovoStato) {
		Issue issue = issueDAO.findById(id)
				.orElseThrow(() -> new NotFoundException(ISSUE_NON_TROVATA_MSG + id));

		if (Boolean.TRUE.equals(issue.getArchiviata())) {
			throw new InvalidFieldException("Non è possibile modificare lo stato di un'issue archiviata");
		}

		Stato stato = parseStato(nuovoStato);
		issue.setStato(stato);

		return issueDAO.save(issue);
	}

	@GetMapping("/visualizza/{id}")
	public Issue visualizzaIssue(@PathVariable(value = "id") Integer id) {
		return issueDAO.findById(id)
				.orElseThrow(() -> new NotFoundException(ISSUE_NON_TROVATA_MSG + id));
	}

	@DeleteMapping("/elimina/{id}")
	@Transactional
	public Map<String, String> eliminaIssue(@PathVariable(value = "id") Integer id) {
		Issue issue = issueDAO.findById(id)
				.orElseThrow(() -> new NotFoundException(ISSUE_NON_TROVATA_MSG + id));

		issueDAO.delete(issue);
		return Map.of(MESSAGE_KEY, "Issue eliminata con successo");
	}

	@GetMapping("/visualizza-lista")
	public List<Issue> visualizzaListaIssue(@RequestParam(value = "archiviata", required = false) Boolean archiviata) {
		return archiviata != null ? issueDAO.findByArchiviata(archiviata) : issueDAO.findAll();
	}

	@GetMapping("/urgenti")
	public List<Issue> trovaUrgenti() {
		return issueDAO.findIssueUrgenti(List.of(Priorita.critical, Priorita.high));
	}

	@GetMapping("/cerca")
	public List<Issue> cercaIssue(@RequestParam(value = "titolo") String titolo) {
		if (titolo == null || titolo.isBlank()) {
			throw new InvalidFieldException("Il parametro 'titolo' è obbligatorio per la ricerca");
		}
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
		return stats;
	}

	

	private int getPrioritaOrdine(Priorita priorita) {
		return switch (priorita) {
		case critical -> 0;
		case high -> 1;
		case medium -> 2;
		case low -> 3;
		case none -> 4;
		};
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
		default -> throw new InvalidFieldException("Priorità non valida: " + value);
		};
	}

	private Stato parseStato(String value) {
		if (value == null || value.isBlank()) {
			throw new InvalidFieldException("Stato non può essere vuoto");
		}

		return switch (value.toLowerCase()) {
		case "todo" -> Stato.Todo;
		case "inprogress", "in_progress" -> Stato.inProgress;
		case "done" -> Stato.Done;
		default -> throw new InvalidFieldException("Stato non valido: " + value);
		};
	}

	private Tipo parseTipo(String value) {
		if (value == null || value.isBlank()) {
			throw new InvalidFieldException("Tipo non può essere vuoto");
		}

		return switch (value.toLowerCase()) {
		case "question" -> Tipo.question;
		case "features" -> Tipo.features;
		case "bug" -> Tipo.bug;
		case "documentation" -> Tipo.documentation;
		default -> throw new InvalidFieldException("Tipo non valido: " + value);
		};
	}
}