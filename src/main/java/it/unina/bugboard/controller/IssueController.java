package it.unina.bugboard.controller;

import it.unina.bugboard.dao.IssueDAO;
import it.unina.bugboard.dao.AllegatoDAO;
import it.unina.bugboard.dao.UtenzaDAO;
import it.unina.bugboard.model.*;
import it.unina.bugboard.exception.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/issue")
@CrossOrigin(origins = "*")
public class IssueController {

    @Autowired
    private IssueDAO issueDAO;

    @Autowired
    private AllegatoDAO allegatoDAO;

    @Autowired
    private UtenzaDAO utenzaDAO;

    @PostMapping("/crea")
    public ResponseEntity<Issue> creaIssue(@RequestBody Map<String, Object> payload) {
        try {
            String titolo = (String) payload.get("titolo");
            String descrizione = (String) payload.get("descrizione");
            String prioritaStr = (String) payload.get("priorita");
            String statoStr = (String) payload.get("stato");
            String tipoStr = (String) payload.get("tipo");
            Integer idCreatore = (Integer) payload.get("idCreatore");

            if (titolo == null || titolo.isBlank()) {
                throw new InvalidInputException("Il titolo è obbligatorio");
            }

            Optional<Issue> existing = issueDAO.findByTitolo(titolo);
            if (existing.isPresent()) {
                throw new AlreadyExistsException("Esiste già un'issue con questo titolo");
            }

            Priorita priorita = parsePriorita(prioritaStr);
            Stato stato = parseStato(statoStr);
            Tipo tipo = parseTipo(tipoStr);

            Utenza creatore = utenzaDAO.findById(idCreatore)
                    .orElseThrow(() -> new NotFoundException("Utente non trovato con id: " + idCreatore));

            Issue issue = new Issue(titolo, descrizione, priorita, stato, tipo, creatore);
            Issue saved = issueDAO.save(issue);

            return ResponseEntity.status(HttpStatus.CREATED).body(saved);

        } catch (IllegalArgumentException e) {
            throw new InvalidInputException("Valori enum non validi per priorita, stato o tipo");
        }
    }

    @PutMapping("/modifica/{id}")
    public ResponseEntity<Issue> modificaIssue(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> payload) {

        Issue issue = issueDAO.findById(id)
                .orElseThrow(() -> new NotFoundException("Issue non trovata con id: " + id));

        if (payload.containsKey("titolo")) {
            issue.setTitolo((String) payload.get("titolo"));
        }
        if (payload.containsKey("descrizione")) {
            issue.setDescrizione((String) payload.get("descrizione"));
        }
        if (payload.containsKey("priorita")) {
            issue.setPriorita(parsePriorita((String) payload.get("priorita")));
        }
        if (payload.containsKey("stato")) {
            issue.setStato(parseStato((String) payload.get("stato")));
        }
        if (payload.containsKey("tipo")) {
            issue.setTipo(parseTipo((String) payload.get("tipo")));
        }

        issue.setDataUltimaModifica(LocalDateTime.now());
        Issue updated = issueDAO.save(issue);

        return ResponseEntity.ok(updated);
    }

    @GetMapping("/filtra")
    public ResponseEntity<List<Issue>> filtraIssue(
            @RequestParam(required = false) String stato,
            @RequestParam(required = false) String priorita,
            @RequestParam(required = false) String tipo) {

        List<Issue> issues;

        if (stato != null && priorita != null) {
            issues = issueDAO.findByStatoAndPriorita(
                    parseStato(stato),
                    parsePriorita(priorita)
            );
        } else if (stato != null) {
            issues = issueDAO.findByStato(parseStato(stato));
        } else if (priorita != null) {
            issues = issueDAO.findByPriorita(parsePriorita(priorita));
        } else if (tipo != null) {
            issues = issueDAO.findByTipo(parseTipo(tipo));
        } else {
            issues = issueDAO.findAll();
        }

        return ResponseEntity.ok(issues);
    }

    @DeleteMapping("/archivia/{id}")
    public ResponseEntity<Map<String, String>> archiviaIssue(
            @PathVariable Integer id,
            @RequestParam Integer idArchiviatore) {

        Issue issue = issueDAO.findById(id)
                .orElseThrow(() -> new NotFoundException("Issue non trovata con id: " + id));

        if (issue.getArchiviata()) {
            throw new InvalidInputException("L'issue è già archiviata");
        }

        issue.setArchiviata(true);
        issue.setDataArchiviazione(LocalDateTime.now());

        Utenza archiviatore = utenzaDAO.findById(idArchiviatore)
                .orElseThrow(() -> new NotFoundException("Utente non trovato con id: " + idArchiviatore));
        issue.setArchiviatore(archiviatore);

        issueDAO.save(issue);

        return ResponseEntity.ok(Map.of("message", "Issue archiviata con successo"));
    }

    @GetMapping("/ordina")
    public ResponseEntity<List<Issue>> ordinaIssue() {
        List<Issue> issues = issueDAO.findAllByOrderByDataUltimaModificaDesc();
        return ResponseEntity.ok(issues);
    }

    @GetMapping("/visualizza/{id}")
    public ResponseEntity<Issue> visualizzaIssue(@PathVariable Integer id) {
        Issue issue = issueDAO.findById(id)
                .orElseThrow(() -> new NotFoundException("Issue non trovata con id: " + id));
        return ResponseEntity.ok(issue);
    }

    @DeleteMapping("/elimina/{id}")
    public ResponseEntity<Map<String, String>> eliminaIssue(@PathVariable Integer id) {
        if (!issueDAO.existsById(id)) {
            throw new NotFoundException("Issue non trovata con id: " + id);
        }
        allegatoDAO.deleteByIssueIdIssue(id);

        issueDAO.deleteById(id);

        return ResponseEntity.ok(Map.of("message", "Issue eliminata con successo"));
    }

    @GetMapping("/visualizza-lista")
    public ResponseEntity<List<Issue>> visualizzaListaIssue(
            @RequestParam(required = false) Boolean archiviata) {

        List<Issue> issues;
        if (archiviata != null) {
            issues = issueDAO.findByArchiviata(archiviata);
        } else {
            issues = issueDAO.findAll();
        }

        return ResponseEntity.ok(issues);
    }

    @GetMapping("/urgenti")
    public ResponseEntity<List<Issue>> visualizzaIssueUrgenti() {
        List<Issue> issues = issueDAO.findIssueUrgenti();
        return ResponseEntity.ok(issues);
    }

    @GetMapping("/cerca")
    public ResponseEntity<List<Issue>> cercaIssue(@RequestParam String titolo) {
        List<Issue> issues = issueDAO.findByTitoloContainingIgnoreCase(titolo);
        return ResponseEntity.ok(issues);
    }

    @GetMapping("/statistiche")
    public ResponseEntity<Map<String, Object>> visualizzaStatistiche() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totali", issueDAO.count());
        stats.put("attive", issueDAO.countByArchiviataFalse());
        stats.put("todo", issueDAO.countByStato(Stato.Todo));
        stats.put("inProgress", issueDAO.countByStato(Stato.inProgress));
        stats.put("done", issueDAO.countByStato(Stato.Done));
        stats.put("risolte", issueDAO.findIssueRisolte().size());
        stats.put("nonRisolte", issueDAO.findIssueNonRisolte().size());

        return ResponseEntity.ok(stats);
    }

    // Metodi helper per parsing enum con case-sensitivity
    private Priorita parsePriorita(String value) {
        if (value == null) {
            throw new InvalidInputException("Priorità non può essere null");
        }
        return switch (value.toLowerCase()) {
            case "critical" -> Priorita.critical;
            case "high" -> Priorita.high;
            case "medium" -> Priorita.medium;
            case "low" -> Priorita.low;
            default -> throw new InvalidInputException("Priorità non valida: " + value);
        };
    }

    private Stato parseStato(String value) {
        if (value == null) {
            throw new InvalidInputException("Stato non può essere null");
        }
        return switch (value.toLowerCase()) {
            case "todo" -> Stato.Todo;
            case "inprogress", "in_progress" -> Stato.inProgress;
            case "done" -> Stato.Done;
            default -> throw new InvalidInputException("Stato non valido: " + value);
        };
    }

    private Tipo parseTipo(String value) {
        if (value == null) {
            throw new InvalidInputException("Tipo non può essere null");
        }
        return switch (value.toLowerCase()) {
            case "question" -> Tipo.question;
            case "features" -> Tipo.features;
            case "bug" -> Tipo.bug;
            case "documentation" -> Tipo.documentation;
            default -> throw new InvalidInputException("Tipo non valido: " + value);
        };
    }
}