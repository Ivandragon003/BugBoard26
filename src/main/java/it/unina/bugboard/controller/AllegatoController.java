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
    public ResponseEntity<Allegato> uploadAllegato(
            @RequestParam("file") MultipartFile file,
            @RequestParam("idIssue") Integer idIssue) {

        Issue issue = issueDAO.findById(idIssue)
                .orElseThrow(() -> new NotFoundException("Issue non trovata con id: " + idIssue));

        if (file == null || file.isEmpty()) {
            throw new InvalidInputException("File mancante o vuoto");
        }

        String percorso = immagineUtil.uploadImmagine(file);

        String nomeFile = file.getOriginalFilename();
        String tipoFile = file.getContentType();
        Integer dimensione = (int) file.getSize();

        Allegato allegato = new Allegato(percorso, nomeFile, tipoFile, dimensione, issue);
        Allegato saved = allegatoDAO.save(allegato);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<ByteArrayResource> downloadAllegato(@PathVariable Integer id) {
        Allegato allegato = allegatoDAO.findById(id)
                .orElseThrow(() -> new NotFoundException("Allegato non trovato con id: " + id));

        byte[] data = immagineUtil.getImageBytes(allegato.getPercorso());
        ByteArrayResource resource = new ByteArrayResource(data);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                        "attachment; filename=\"" + allegato.getNomeFile() + "\"")
                .contentType(MediaType.parseMediaType(
                        immagineUtil.getContentType(allegato.getPercorso())))
                .contentLength(data.length)
                .body(resource);
    }

    @GetMapping("/issue/{idIssue}")
    public ResponseEntity<List<Allegato>> getAllegatiByIssue(@PathVariable Integer idIssue) {
        if (!issueDAO.existsById(idIssue)) {
            throw new NotFoundException("Issue non trovata con id: " + idIssue);
        }

        List<Allegato> allegati = allegatoDAO.findByIssueIdIssue(idIssue);
        return ResponseEntity.ok(allegati);
    }

    @GetMapping("/issue/{idIssue}/ordinati-dimensione")
    public ResponseEntity<List<Allegato>> getAllegatiOrderByDimensione(@PathVariable Integer idIssue) {
        if (!issueDAO.existsById(idIssue)) {
            throw new NotFoundException("Issue non trovata con id: " + idIssue);
        }

        List<Allegato> allegati = allegatoDAO.findAllegatiByIssueOrderByDimensioneDesc(idIssue);
        return ResponseEntity.ok(allegati);
    }

    @GetMapping("/issue/{idIssue}/dimensione-totale")
    public ResponseEntity<Map<String, Object>> getDimensioneTotale(@PathVariable Integer idIssue) {
        if (!issueDAO.existsById(idIssue)) {
            throw new NotFoundException("Issue non trovata con id: " + idIssue);
        }

        Long totale = allegatoDAO.sumDimensioniByIssue(idIssue);
        if (totale == null) {
            totale = 0L;
        }

        return ResponseEntity.ok(Map.of(
                "idIssue", idIssue,
                "dimensioneTotaleBytes", totale,
                "dimensioneTotaleMB", totale / (1024.0 * 1024.0)
        ));
    }

    @GetMapping("/issue/{idIssue}/count")
    public ResponseEntity<Map<String, Object>> countAllegati(@PathVariable Integer idIssue) {
        if (!issueDAO.existsById(idIssue)) {
            throw new NotFoundException("Issue non trovata con id: " + idIssue);
        }

        Long count = allegatoDAO.countByIssueIdIssue(idIssue);
        return ResponseEntity.ok(Map.of("idIssue", idIssue, "numeroAllegati", count));
    }

    @GetMapping("/tipo/{tipoFile}")
    public ResponseEntity<List<Allegato>> getAllegatiByTipo(@PathVariable String tipoFile) {
        List<Allegato> allegati = allegatoDAO.findByTipoFile(tipoFile);
        return ResponseEntity.ok(allegati);
    }

    @GetMapping("/tipo/{tipoFile}/issue/{idIssue}")
    public ResponseEntity<List<Allegato>> getAllegatiByTipoAndIssue(
            @PathVariable String tipoFile,
            @PathVariable Integer idIssue) {

        if (!issueDAO.existsById(idIssue)) {
            throw new NotFoundException("Issue non trovata con id: " + idIssue);
        }

        List<Allegato> allegati = allegatoDAO.findByTipoFileAndIssueIdIssue(tipoFile, idIssue);
        return ResponseEntity.ok(allegati);
    }

    @GetMapping("/cerca")
    public ResponseEntity<List<Allegato>> cercaAllegati(@RequestParam String nomeFile) {
        List<Allegato> allegati = allegatoDAO.findByNomeFileContainingIgnoreCase(nomeFile);
        return ResponseEntity.ok(allegati);
    }

    @GetMapping("/recenti")
    public ResponseEntity<List<Allegato>> getAllegatiRecenti() {
        List<Allegato> allegati = allegatoDAO.findAllByOrderByDataCaricamentoDesc();
        return ResponseEntity.ok(allegati);
    }

    @GetMapping("/issue/{idIssue}/recenti")
    public ResponseEntity<List<Allegato>> getAllegatiRecentiByIssue(@PathVariable Integer idIssue) {
        if (!issueDAO.existsById(idIssue)) {
            throw new NotFoundException("Issue non trovata con id: " + idIssue);
        }

        List<Allegato> allegati = allegatoDAO.findByIssueIdIssueOrderByDataCaricamentoDesc(idIssue);
        return ResponseEntity.ok(allegati);
    }

    @GetMapping("/dimensione")
    public ResponseEntity<List<Allegato>> filtraPerDimensione(
            @RequestParam(required = false) Integer min,
            @RequestParam(required = false) Integer max) {

        List<Allegato> allegati;

        if (min != null && max != null) {
            allegati = allegatoDAO.findByDimensioneBetween(min, max);
        } else if (min != null) {
            allegati = allegatoDAO.findByDimensioneGreaterThan(min);
        } else if (max != null) {
            allegati = allegatoDAO.findByDimensioneLessThan(max);
        } else {
            allegati = allegatoDAO.findAll();
        }

        return ResponseEntity.ok(allegati);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Map<String, String>> eliminaAllegato(@PathVariable Integer id) {
        Allegato allegato = allegatoDAO.findById(id)
                .orElseThrow(() -> new NotFoundException("Allegato non trovato con id: " + id));

        try {
            immagineUtil.deleteImmagine(allegato.getPercorso());
        } catch (Exception e) {
            System.err.println("Errore eliminazione file: " + e.getMessage());
        }

        allegatoDAO.delete(allegato);

        return ResponseEntity.ok(Map.of("message", "Allegato eliminato con successo"));
    }

    @DeleteMapping("/issue/{idIssue}")
    @Transactional
    public ResponseEntity<Map<String, Object>> eliminaAllegatiByIssue(@PathVariable Integer idIssue) {
        if (!issueDAO.existsById(idIssue)) {
            throw new NotFoundException("Issue non trovata con id: " + idIssue);
        }

        List<Allegato> allegati = allegatoDAO.findByIssueIdIssue(idIssue);
        
        for (Allegato allegato : allegati) {
            try {
                immagineUtil.deleteImmagine(allegato.getPercorso());
            } catch (Exception e) {
                System.err.println("Errore eliminazione file: " + e.getMessage());
            }
        }

        allegatoDAO.deleteByIssueIdIssue(idIssue);

        return ResponseEntity.ok(Map.of(
                "message", "Allegati eliminati con successo",
                "numeroAllegati", allegati.size()
        ));
    }


    @GetMapping("/statistiche")
    public ResponseEntity<Map<String, Object>> getStatistiche() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totaleAllegati", allegatoDAO.count());
        
        Map<String, Long> tipiCount = new HashMap<>();
        List<Allegato> tutti = allegatoDAO.findAll();
        for (Allegato a : tutti) {
            tipiCount.merge(a.getTipoFile(), 1L, Long::sum);
        }
        stats.put("distribuzionePerTipo", tipiCount);

        return ResponseEntity.ok(stats);
    }
}