package it.unina.bugboard.controller;

import it.unina.bugboard.dao.AllegatoDAO;
import it.unina.bugboard.dao.IssueDAO;
import it.unina.bugboard.model.Allegato;
import it.unina.bugboard.model.Issue;
import it.unina.bugboard.model.Utenza;
import it.unina.bugboard.util.ImageUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/issues")
public class IssueController {

    private final IssueDAO issueDAO;
    private final AllegatoDAO allegatoDAO;

    // se vuoi accedere a utenti dal DB per ricavare Utenza dall'authentication:
    // private final UtenzaDAO utenzaDAO;

    @Value("${bugboard.upload.dir}")
    private String uploadDir;

    @Value("${bugboard.max-file-size-bytes:5242880}") // default 5MB
    private long maxFileSizeBytes;

    public IssueController(IssueDAO issueDAO, AllegatoDAO allegatoDAO /*, UtenzaDAO utenzaDAO */) {
        this.issueDAO = issueDAO;
        this.allegatoDAO = allegatoDAO;
        // this.utenzaDAO = utenzaDAO;
    }

    // --- CRUD base per Issue ------------------------------------------------

    @PostMapping
    public ResponseEntity<?> createIssue(@RequestBody Issue issue /*, Principal principal */) {
        // valida campi minimi (RD-1)
        if (issue.getTitolo() == null || issue.getTitolo().isBlank() || issue.getTitolo().length() > 200) {
            return ResponseEntity.badRequest().body("Titolo mancante o troppo lungo (max 200)");
        }
        if (issue.getDescrizione() == null || issue.getDescrizione().isBlank() || issue.getDescrizione().length() > 5000) {
            return ResponseEntity.badRequest().body("Descrizione mancante o troppo lunga (max 5000)");
        }
        // imposto campi obbligatori
        issue.setDataCreazione(LocalDateTime.now());
        issue.setDataUltimaModifica(LocalDateTime.now());
        // stato iniziale TODO (assumo enum definito)
        // issue.setStato(Stato.Todo); // disabilitato se vuoi settarlo esplicitamente
        Issue saved = issueDAO.save(issue);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getIssue(@PathVariable Integer id) {
        Optional<Issue> maybe = issueDAO.findById(id);
        return maybe.<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Issue non trovata"));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> updateIssue(@PathVariable Integer id, @RequestBody Issue updated) {
        Optional<Issue> maybe = issueDAO.findById(id);
        if (maybe.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Issue non trovata");
        Issue issue = maybe.get();

        // RD-1: tipo non modificabile dopo la creazione
        if (updated.getTipo() != null && !updated.getTipo().equals(issue.getTipo())) {
            return ResponseEntity.badRequest().body("Il tipo di issue non è modificabile");
        }

        // non permettere modifica dopo done ecc salvo admin (qui controllo minimale)
        // if (issue.getStato() == Stato.Done) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Non modificabile in stato DONE");

        // applico campi modificabili
        if (updated.getTitolo() != null) issue.setTitolo(updated.getTitolo());
        if (updated.getDescrizione() != null) issue.setDescrizione(updated.getDescrizione());
        if (updated.getPriorita() != null) issue.setPriorita(updated.getPriorita());
        if (updated.getStato() != null) issue.setStato(updated.getStato());
        issue.setDataUltimaModifica(LocalDateTime.now());

        Issue saved = issueDAO.save(issue);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteIssue(@PathVariable Integer id) {
        if (!issueDAO.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Issue non trovata");
        }
        issueDAO.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // --- Archivia / Ripristina ------------------------------------------------

    @PostMapping("/{id}/archive")
    @Transactional
    public ResponseEntity<?> archiveIssue(@PathVariable Integer id /*, Principal principal */) {
        Optional<Issue> maybe = issueDAO.findById(id);
        if (maybe.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Issue non trovata");
        Issue issue = maybe.get();
        issue.setArchiviata(true);
        issue.setArchiviatore(null); // opzionale: impostare archiviatore
        issue.setDataUltimaModifica(LocalDateTime.now());
        issueDAO.save(issue);
        return ResponseEntity.ok(issue);
    }

    @PostMapping("/{id}/restore")
    @Transactional
    public ResponseEntity<?> restoreIssue(@PathVariable Integer id) {
        Optional<Issue> maybe = issueDAO.findById(id);
        if (maybe.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Issue non trovata");
        Issue issue = maybe.get();
        issue.setArchiviata(false);
        issue.setDataUltimaModifica(LocalDateTime.now());
        issueDAO.save(issue);
        return ResponseEntity.ok(issue);
    }

    // --- Upload immagine e gestione Allegato -------------------------------

    /**
     * Upload immagine come allegato ad una issue.
     * Restituisce Allegato creato.
     */
    @PostMapping("/{id}/attachments")
    @Transactional
    public ResponseEntity<?> uploadAttachment(@PathVariable Integer id,
                                              @RequestParam("file") MultipartFile file /*, Principal principal */) {
        Optional<Issue> maybe = issueDAO.findById(id);
        if (maybe.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Issue non trovata");
        Issue issue = maybe.get();

        try {
            Path root = Paths.get(uploadDir).toAbsolutePath().normalize();

            // consigliato: creare sottocartella per issue
            Path issueFolder = root.resolve("issues").resolve(String.valueOf(id));
            String savedPath = ImageUtil.uploadImmagine(file, issueFolder, maxFileSizeBytes);

            Allegato allegato = new Allegato();
            allegato.setPercorso(savedPath);
            allegato.setNomeFile(file.getOriginalFilename());
            // tipoFile: usiamo estensione senza dot
            String ext = file.getOriginalFilename() != null && file.getOriginalFilename().contains(".")
                    ? file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf('.') + 1).toLowerCase()
                    : "bin";
            allegato.setTipoFile(ext);
            allegato.setDimensione((int) Math.min(file.getSize(), Integer.MAX_VALUE));
            allegato.setDataCaricamento(LocalDateTime.now());
            allegato.setIssue(issue);

            Allegato saved = allegatoDAO.save(allegato);

            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException iae) {
            return ResponseEntity.badRequest().body(iae.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Errore upload: " + e.getMessage());
        }
    }

    // lista allegati per issue
    @GetMapping("/{id}/attachments")
    public ResponseEntity<?> listAttachments(@PathVariable Integer id) {
        Optional<Issue> maybe = issueDAO.findById(id);
        if (maybe.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Issue non trovata");
        List<Allegato> files = allegatoDAO.findByIssueIdIssue(id);
        return ResponseEntity.ok(files);
    }

    // elimina allegato (db + file) — ATTENZIONE: rimuove solo record DB; cancellazione FS opzionale
    @DeleteMapping("/{id}/attachments/{allegatoId}")
    @Transactional
    public ResponseEntity<?> deleteAttachment(@PathVariable Integer id, @PathVariable Integer allegatoId) {
        Optional<Allegato> maybe = allegatoDAO.findById(allegatoId);
        if (maybe.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Allegato non trovato");
        Allegato a = maybe.get();
        if (!a.getIssue().getIdIssue().equals(id)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Allegato non appartiene a questa issue");
        }

        // cancellazione file FS (silenziosa se non presente)
        try {
            Path p = Paths.get(a.getPercorso());
            java.nio.file.Files.deleteIfExists(p);
        } catch (Exception ignore) { }

        allegatoDAO.deleteById(allegatoId);
        return ResponseEntity.noContent().build();
    }

    // --- Filtri/ricerche di esempio (RD-5) -----------------------------------
    @GetMapping
    public ResponseEntity<?> listAll(@RequestParam(required = false) String tipo,
                                     @RequestParam(required = false) String stato,
                                     @RequestParam(required = false) String priorita) {
        // per semplicità: supporto alcuni filtri base; puoi estendere collegando Specification/Criteria
        if (stato != null) {
            // es: /api/issues?stato=todo
            try {
                // supponendo che Stato sia enum con valore toString lowercase o uppercase
                // adattare se il tuo enum è differente
                var s = Enum.valueOf((Class<Enum>) Class.forName("it.unina.bugboard.model.Stato"), capitalize(stato));
                return ResponseEntity.ok(issueDAO.findByStato((Enum) s));
            } catch (Exception ignored) { /* ignore - fallback */ }
        }
        if (priorita != null) {
            try {
                var p = Enum.valueOf((Class<Enum>) Class.forName("it.unina.bugboard.model.Priorita"), capitalize(priorita));
                return ResponseEntity.ok(issueDAO.findByPriorita((Enum) p));
            } catch (Exception ignored) { /* ignore - fallback */ }
        }

        // fallback: tutte
        return ResponseEntity.ok(issueDAO.findAll());
    }

    private static String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        String low = s.toLowerCase();
        return Character.toUpperCase(low.charAt(0)) + low.substring(1);
    }
}
