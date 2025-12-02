package it.unina.bugboard.controller;

import it.unina.bugboard.dao.IssueDAO;
import it.unina.bugboard.dao.UtenzaDAO;
import it.unina.bugboard.model.*;
import it.unina.bugboard.exception.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/issue")
public class IssueController {

	@Autowired
	private IssueDAO issueDAO;

	@Autowired
	private UtenzaDAO utenzaDAO;

	@PostMapping("/crea")
	public Issue creaIssue(@RequestBody Map<String, Object> payload) {
		String titolo = (String) payload.get("titolo");
		String descrizione = (String) payload.get("descrizione");
		String prioritaStr = (String) payload.get("priorita");
		String statoStr = (String) payload.get("stato");
		String tipoStr = (String) payload.get("tipo");
		Integer idCreatore = (Integer) payload.get("idCreatore");
		Integer idAssegnatario = (Integer) payload.get("idAssegnatario");

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
		
		// Gestisci assegnatario se presente
		if (idAssegnatario != null) {
			Utenza assegnatario = utenzaDAO.findById(idAssegnatario)
					.orElseThrow(() -> new NotFoundException("Utente assegnatario non trovato con id: " + idAssegnatario));
			issue.setAssegnatario(assegnatario);
		}
		
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

<<<<<<< HEAD
=======
		// Gestisci assegnatario
		if (payload.containsKey("idAssegnatario")) {
			Object idAssegnatarioObj = payload.get("idAssegnatario");
			if (idAssegnatarioObj == null) {
				issue.setAssegnatario(null);
			} else {
				Integer idAssegnatario = null;
				if (idAssegnatarioObj instanceof Integer) {
					idAssegnatario = (Integer) idAssegnatarioObj;
				} else if (idAssegnatarioObj instanceof String) {
					idAssegnatario = Integer.parseInt((String) idAssegnatarioObj);
				}
				
				if (idAssegnatario != null) {
					Utenza assegnatario = utenzaDAO.findById(idAssegnatario)
							.orElseThrow(() -> new NotFoundException("Utente assegnatario non trovato con id: " + idAssegnatario));
					issue.setAssegnatario(assegnatario);
				}
			}
		}
	
>>>>>>> 960e4108ec1442e573e62054a5a2c28c79dd7c4a
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

	
	@GetMapping("/filtra-avanzato")
	public List<Issue> filtraAvanzato(
			@RequestParam(required = false) String stato,
			@RequestParam(required = false) String priorita,
			@RequestParam(required = false) String tipo,
			@RequestParam(required = false) String ricerca,
			@RequestParam(required = false) String ordinamento,
			@RequestParam(required = false, defaultValue = "false") Boolean archiviata) {

		
		List<Issue> issues = archiviata ? issueDAO.findByArchiviata(true) : issueDAO.findByArchiviataFalse();

		
		if (stato != null && !stato.isEmpty()) {
			Stato statoEnum = parseStato(stato);
			issues = issues.stream()
					.filter(i -> i.getStato() == statoEnum)
					.collect(Collectors.toList());
		}

		if (priorita != null && !priorita.isEmpty()) {
			Priorita prioritaEnum = parsePriorita(priorita);
			issues = issues.stream()
					.filter(i -> i.getPriorita() == prioritaEnum)
					.collect(Collectors.toList());
		}

		if (tipo != null && !tipo.isEmpty()) {
			Tipo tipoEnum = parseTipo(tipo);
			issues = issues.stream()
					.filter(i -> i.getTipo() == tipoEnum)
					.collect(Collectors.toList());
		}

		// Ricerca per titolo
		if (ricerca != null && !ricerca.isEmpty()) {
			String ricercaLower = ricerca.toLowerCase();
			issues = issues.stream()
					.filter(i -> i.getTitolo().toLowerCase().contains(ricercaLower))
					.collect(Collectors.toList());
		}

		// Ordinamento
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
					issues.sort((a, b) -> {
						int ordineA = getPrioritaOrdine(a.getPriorita());
						int ordineB = getPrioritaOrdine(b.getPriorita());
						return Integer.compare(ordineA, ordineB);
					});
					break;
				case "priorita_bassa":
					issues.sort((a, b) -> {
						int ordineA = getPrioritaOrdine(a.getPriorita());
						int ordineB = getPrioritaOrdine(b.getPriorita());
						return Integer.compare(ordineB, ordineA);
					});
					break;
				default:
					// Default: data più recente
					issues.sort((a, b) -> b.getDataCreazione().compareTo(a.getDataCreazione()));
			}
		} else {
			// Default sorting
			issues.sort((a, b) -> b.getDataCreazione().compareTo(a.getDataCreazione()));
		}

		return issues;
	}

	// Helper per ordinamento priorità
	private int getPrioritaOrdine(Priorita priorita) {
		switch (priorita) {
			case critical: return 0;
			case high: return 1;
			case medium: return 2;
			case low: return 3;
			case none: return 4;
			default: return 5;
		}
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

<<<<<<< HEAD
=======
	// Metodi per gestione utenti assegnati (lista multipla - se la usi ancora)
>>>>>>> 960e4108ec1442e573e62054a5a2c28c79dd7c4a
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
}
