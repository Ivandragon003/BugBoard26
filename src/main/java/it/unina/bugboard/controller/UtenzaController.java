package it.unina.bugboard.controller;

import it.unina.bugboard.model.Utenza;
import it.unina.bugboard.model.Ruolo;
import it.unina.bugboard.dao.UtenzaDAO;
import it.unina.bugboard.exception.InvalidFieldException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/utenze")
@CrossOrigin(origins = "*")
public class UtenzaController {

    @Autowired
    private UtenzaDAO utenzaDAO;

    /**
     * Login utente
     * POST /api/utenze/login
     * Body: { "email": "...", "password": "..." }
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");

            if (email == null || password == null) {
                return new ResponseEntity<>("Email e password sono obbligatori", HttpStatus.BAD_REQUEST);
            }

            Optional<Utenza> utenza = utenzaDAO.findByEmail(email);
            
            if (utenza.isEmpty()) {
                return new ResponseEntity<>("Credenziali non valide", HttpStatus.UNAUTHORIZED);
            }

            Utenza user = utenza.get();
            
            // NOTA: In produzione usa BCrypt per confrontare password hashate
            if (!user.getPassword().equals(password)) {
                return new ResponseEntity<>("Credenziali non valide", HttpStatus.UNAUTHORIZED);
            }

            // Ritorna i dati utente (senza password)
            Map<String, Object> response = new HashMap<>();
            response.put("idUtente", user.getIdUtente());
            response.put("nome", user.getNome());
            response.put("cognome", user.getCognome());
            response.put("email", user.getEmail());
            response.put("ruolo", user.getRuolo());

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Errore durante il login", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Crea una nuova utenza
     * POST /api/utenze
     */
    @PostMapping
    public ResponseEntity<?> creaUtenza(@RequestBody Utenza utenza) {
        try {
            // Verifica se l'email esiste già
            if (utenzaDAO.existsByEmail(utenza.getEmail())) {
                return new ResponseEntity<>("Email già registrata", HttpStatus.CONFLICT);
            }

            // NOTA: In produzione, hashare la password con BCrypt prima di salvare
            // utenza.setPassword(passwordEncoder.encode(utenza.getPassword()));

            Utenza salvata = utenzaDAO.save(utenza);
            
            // Rimuovi la password dalla risposta
            salvata.setPassword(null);
            
            return new ResponseEntity<>(salvata, HttpStatus.CREATED);
        } catch (InvalidFieldException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Errore nella creazione dell'utenza", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Visualizza una singola utenza
     * GET /api/utenze/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> visualizzaUtenza(@PathVariable Integer id) {
        try {
            Optional<Utenza> utenza = utenzaDAO.findById(id);
            if (utenza.isEmpty()) {
                return new ResponseEntity<>("Utenza non trovata", HttpStatus.NOT_FOUND);
            }
            
            Utenza user = utenza.get();
            user.setPassword(null); // Non inviare la password
            
            return new ResponseEntity<>(user, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Errore nel recupero dell'utenza", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Visualizza la lista di tutte le utenze
     * GET /api/utenze
     */
    @GetMapping
    public ResponseEntity<?> visualizzaListaUtenze(@RequestParam(required = false) Ruolo ruolo) {
        try {
            if (ruolo != null) {
                return new ResponseEntity<>(utenzaDAO.findByRuolo(ruolo), HttpStatus.OK);
            }
            return new ResponseEntity<>(utenzaDAO.findAll(), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Errore nel recupero delle utenze", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Modifica un'utenza esistente
     * PUT /api/utenze/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> modificaUtenza(@PathVariable Integer id, @RequestBody Utenza utenza) {
        try {
            Optional<Utenza> utenzaEsistente = utenzaDAO.findById(id);
            if (utenzaEsistente.isEmpty()) {
                return new ResponseEntity<>("Utenza non trovata", HttpStatus.NOT_FOUND);
            }

            Utenza daModificare = utenzaEsistente.get();

            if (utenza.getNome() != null) daModificare.setNome(utenza.getNome());
            if (utenza.getCognome() != null) daModificare.setCognome(utenza.getCognome());
            if (utenza.getEmail() != null && !utenza.getEmail().equals(daModificare.getEmail())) {
                // Verifica che la nuova email non sia già in uso
                if (utenzaDAO.existsByEmail(utenza.getEmail())) {
                    return new ResponseEntity<>("Email già in uso", HttpStatus.CONFLICT);
                }
                daModificare.setEmail(utenza.getEmail());
            }
            if (utenza.getPassword() != null) {
                // NOTA: In produzione, hashare la password
                daModificare.setPassword(utenza.getPassword());
            }
            if (utenza.getRuolo() != null) daModificare.setRuolo(utenza.getRuolo());

            Utenza aggiornata = utenzaDAO.save(daModificare);
            aggiornata.setPassword(null); // Non inviare la password
            
            return new ResponseEntity<>(aggiornata, HttpStatus.OK);
        } catch (InvalidFieldException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Errore nella modifica dell'utenza", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Elimina un'utenza
     * DELETE /api/utenze/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminaUtenza(@PathVariable Integer id) {
        try {
            if (!utenzaDAO.existsById(id)) {
                return new ResponseEntity<>("Utenza non trovata", HttpStatus.NOT_FOUND);
            }
            utenzaDAO.deleteById(id);
            return new ResponseEntity<>("Utenza eliminata con successo", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Errore nell'eliminazione dell'utenza", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Cerca utenze per nome o cognome
     * GET /api/utenze/cerca
     */
    @GetMapping("/cerca")
    public ResponseEntity<?> cercaUtenze(@RequestParam String termine) {
        try {
            return new ResponseEntity<>(utenzaDAO.searchByNomeOrCognome(termine), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Errore nella ricerca delle utenze", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}