package it.unina.bugboard.controller;

import it.unina.bugboard.model.Issue;
import it.unina.bugboard.model.Stato;
import it.unina.bugboard.model.Priorita;
import it.unina.bugboard.dao.IssueDAO;
import it.unina.bugboard.exception.InvalidFieldException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/issues")
@CrossOrigin(origins = "*")
public class IssueController {

    @Autowired
    private IssueDAO issueDAO;

    /**
     * Crea una nuova issue
     * POST /api/issues
     */
    @PostMapping
    public ResponseEntity<?> creaIssue(@RequestBody Issue issue) {
        try {
            issue.setDataCreazione(LocalDateTime.now());
            issue.setDataUltimaModifica(LocalDateTime.now());
            Issue salvata = issueDAO.save(issue);
            return new ResponseEntity<>(salvata, HttpStatus.CREATED);
        } catch (InvalidFieldException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Errore nella creazione dell'issue", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Modifica un'issue esistente
     * PUT /api/issues/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> modificaIssue(@PathVariable Integer id, @RequestBody Issue issue) {
        try {
            Optional<Issue> issueEsistente = issueDAO.findById(id);
            if (issueEsistente.isEmpty()) {
                return new ResponseEntity<>("Issue non trovata", HttpStatus.NOT_FOUND);
            }

            Issue daModificare = issueEsistente.get();
            
            if (issue.getTitolo() != null) daModificare.setTitolo(issue.getTitolo());
            if (issue.getDescrizione() != null) daModificare.setDescrizione(issue.getDescrizione());
            if (issue.getPriorita() != null) daModificare.setPriorita(issue.getPriorita());
            if (issue.getStato() != null) {
                daModificare.setStato(issue.getStato());
                // Se lo stato diventa Done, imposta data risoluzione
                if (issue.getStato() == Stato.Done && daModificare.getDataRisoluzione() == null) {
                    daModificare.setDataRisoluzione(LocalDateTime.now());
                }
            }
            if (issue.getTipo() != null) daModificare.setTipo(issue.getTipo());
            
            daModificare.setDataUltimaModifica(LocalDateTime.now());
            
            Issue aggiornata = issueDAO.save(daModificare);
            return new ResponseEntity<>(aggiornata, HttpStatus.OK);
        } catch (InvalidFieldException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Errore nella modifica dell'issue", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Filtra le issue in base ai parametri
     * GET /api/issues/filtra
     */
    @GetMapping("/filtra")
    public ResponseEntity<?> filtraIssue(
            @RequestParam(required = false) Stato stato,
            @RequestParam(required = false) Priorita priorita,
            @RequestParam(required = false) Boolean archiviata) {
        try {
            List<Issue> issues;

            if (stato != null && priorita != null) {
                issues = issueDAO.findByStatoAndPriorita(stato, priorita);
            } else if (stato != null) {
                if (archiviata != null && !archiviata) {
                    issues = issueDAO.findByStatoAndArchiviataFalse(stato);
                } else {
                    issues = issueDAO.findByStato(stato);
                }
            } else if (priorita != null) {
                if (archiviata != null && !archiviata) {
                    issues = issueDAO.findByPrioritaAndArchiviataFalseOrderByDataCreazioneDesc(priorita);
                } else {
                    issues = issueDAO.findByPriorita(priorita);
                }
            } else if (archiviata != null) {
                issues = issueDAO.findByArchiviata(archiviata);
            } else {
                issues = issueDAO.findAll();
            }

            return new ResponseEntity<>(issues, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Errore nel filtraggio delle issue", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Archivia un'issue
     * PUT /api/issues/{id}/archivia
     */
    @PutMapping("/{id}/archivia")
    public ResponseEntity<?> archiviaIssue(@PathVariable Integer id, @RequestParam Integer idArchiviatore) {
        try {
            Optional<Issue> issueOpt = issueDAO.findById(id);
            if (issueOpt.isEmpty()) {
                return new ResponseEntity<>("Issue non trovata", HttpStatus.NOT_FOUND);
            }

            Issue issue = issueOpt.get();
            issue.setArchiviata(true);
            issue.setDataArchiviazione(LocalDateTime.now());
            // Dovresti anche impostare l'archiviatore recuperandolo dal DAO Utenza
            
            Issue archiviata = issueDAO.save(issue);
            return new ResponseEntity<>(archiviata, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Errore nell'archiviazione dell'issue", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Ordina le issue (per data, priorità, ecc.)
     * GET /api/issues/ordina
     */
    @GetMapping("/ordina")
    public ResponseEntity<?> ordinaIssue(@RequestParam(defaultValue = "dataCreazione") String campo) {
        try {
            List<Issue> issues;
            
            switch (campo.toLowerCase()) {
                case "dataultimamodifica":
                    issues = issueDAO.findAllByOrderByDataUltimaModificaDesc();
                    break;
                case "datacreazione":
                default:
                    issues = issueDAO.findAll();
                    break;
            }

            return new ResponseEntity<>(issues, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Errore nell'ordinamento delle issue", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Visualizza una singola issue
     * GET /api/issues/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> visualizzaIssue(@PathVariable Integer id) {
        try {
            Optional<Issue> issue = issueDAO.findById(id);
            if (issue.isEmpty()) {
                return new ResponseEntity<>("Issue non trovata", HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(issue.get(), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Errore nel recupero dell'issue", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Elimina un'issue
     * DELETE /api/issues/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminaIssue(@PathVariable Integer id) {
        try {
            if (!issueDAO.existsById(id)) {
                return new ResponseEntity<>("Issue non trovata", HttpStatus.NOT_FOUND);
            }
            issueDAO.deleteById(id);
            return new ResponseEntity<>("Issue eliminata con successo", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Errore nell'eliminazione dell'issue", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Visualizza la lista di tutte le issue
     * GET /api/issues
     */
    @GetMapping
    public ResponseEntity<?> visualizzaListaIssue() {
        try {
            List<Issue> issues = issueDAO.findAll();
            return new ResponseEntity<>(issues, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Errore nel recupero della lista issue", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}