package it.unina.bugboard.controller;

import it.unina.bugboard.dao.UtenzaDAO;
import it.unina.bugboard.model.Ruolo;
import it.unina.bugboard.model.Utenza;
import it.unina.bugboard.exception.InvalidFieldException;
import it.unina.bugboard.util.AccessTokenUtil;
import it.unina.bugboard.util.PasswordUtil;
import it.unina.bugboard.util.EmailUtil;
import it.unina.bugboard.util.ValidationUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/utenza")
public class UtenzaController {

    @Autowired
    private UtenzaDAO utenzaDAO;

    @Autowired
    private AccessTokenUtil accessTokenUtil;

    @Autowired
    private PasswordUtil passwordUtil;

    @Autowired
    private EmailUtil emailUtil;

    @Autowired
    private ValidationUtil validationUtil;


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");
            String ruoloStr = credentials.get("ruolo");
            
            // Valida email
            validationUtil.validaEmailFormat(email);
            
            // Converti ruolo
            Ruolo ruolo = Ruolo.valueOf(ruoloStr.toUpperCase());
            
            // Cerca utente per email
            Optional<Utenza> utenzaOpt = utenzaDAO.findByEmail(email);
            
            if (utenzaOpt.isEmpty()) {
                throw new InvalidFieldException("Credenziali non valide");
            }
            
            Utenza utenza = utenzaOpt.get();
            
            // Verifica ruolo
            if (!utenza.getRuolo().equals(ruolo)) {
                throw new InvalidFieldException("Credenziali non valide");
            }
            
            // Verifica che l'account sia attivo
            if (!utenza.getStato()) {
                throw new InvalidFieldException("Account disattivato");
            }
            
            // Verifica password
            if (!passwordUtil.HashPassword(password).equals(utenza.getPassword())) {
                throw new InvalidFieldException("Credenziali non valide");
            }
            
            // Genera token
            String token = accessTokenUtil.generaToken(utenza);
            
            return ResponseEntity.ok(Map.of(
                "message", "Login effettuato con successo",
                "token", token,
                "utente", Map.of(
                    "id", utenza.getIdUtente(),
                    "nome", utenza.getNome(),
                    "cognome", utenza.getCognome(),
                    "email", utenza.getEmail(),
                    "ruolo", utenza.getRuolo().toString()
                )
            ));
        } catch (InvalidFieldException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Errore durante il login"));
        }
    }

    /**
     * Creazione di una nuova utenza
     * @param utenzaData dati della nuova utenza
     * @param token JWT token dell'utente che sta creando
     * @return ResponseEntity con utenza creata o messaggio di errore
     */
    @PostMapping("/crea")
    public ResponseEntity<?> creaUtenza(
            @RequestBody Map<String, Object> utenzaData,
            @RequestHeader("Authorization") String token) {
        try {
            // Estrai e verifica il token
            String jwtToken = token.replace("Bearer ", "");
            Utenza creatore = accessTokenUtil.verificaToken(jwtToken);
            
            // Verifica che il creatore sia attivo
            if (!creatore.getStato()) {
                throw new InvalidFieldException("Account creatore non attivo");
            }
            
            // Estrai i dati dalla richiesta
            String nome = (String) utenzaData.get("nome");
            String cognome = (String) utenzaData.get("cognome");
            String email = (String) utenzaData.get("email");
            String password = (String) utenzaData.get("password");
            Ruolo ruolo = Ruolo.valueOf(((String) utenzaData.get("ruolo")).toUpperCase());
            
            // Valida email unica usando il metodo del DAO
            validationUtil.validaUniqueEmail(email);
            
            // Verifica se email esiste già usando il metodo esistente
            if (utenzaDAO.existsByEmail(email)) {
                throw new InvalidFieldException("Email già registrata");
            }
            
            // Hash della password
            String hashedPassword = passwordUtil.HashPassword(password);
            
            // Crea nuova utenza
            Utenza nuovaUtenza = new Utenza(nome, cognome, email, hashedPassword, ruolo, creatore);
            
            // Salva nel database
            Utenza utenzaSalvata = utenzaDAO.save(nuovaUtenza);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                        "message", "Utenza creata con successo",
                        "utenza", Map.of(
                            "id", utenzaSalvata.getIdUtente(),
                            "nome", utenzaSalvata.getNome(),
                            "cognome", utenzaSalvata.getCognome(),
                            "email", utenzaSalvata.getEmail(),
                            "ruolo", utenzaSalvata.getRuolo().toString(),
                            "stato", utenzaSalvata.getStato()
                        )
                    ));
        } catch (InvalidFieldException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Errore durante la creazione dell'utenza"));
        }
    }

    /**
     * Recupero password
     * @param data contiene l'email dell'utente
     * @return ResponseEntity con messaggio di conferma
     */
    @PostMapping("/recupera-password")
    public ResponseEntity<?> recuperaPassword(@RequestBody Map<String, String> data) {
        try {
            String email = data.get("email");
            
            // Valida email
            validationUtil.validaEmailFormat(email);
            
            // Cerca utente per email
            Optional<Utenza> utenzaOpt = utenzaDAO.findByEmail(email);
            
            if (utenzaOpt.isEmpty()) {
                throw new InvalidFieldException("Email non trovata");
            }
            
            Utenza utenza = utenzaOpt.get();
            
            // Genera nuova password temporanea
            String nuovaPassword = passwordUtil.generaPassword();
            String hashedPassword = passwordUtil.HashPassword(nuovaPassword);
            
            // Aggiorna password
            utenza.setPassword(hashedPassword);
            utenzaDAO.save(utenza);
            
            // Invia email
            emailUtil.sendEmail(
                email,
                "Recupero Password - BugBoard",
                "La tua nuova password temporanea è: " + nuovaPassword
            );
            
            return ResponseEntity.ok(Map.of(
                "message", "Email di recupero password inviata con successo"
            ));
        } catch (InvalidFieldException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Errore durante il recupero password"));
        }
    }

    /**
     * Ottieni informazioni utente autenticato
     * @param token JWT token
     * @return ResponseEntity con dati utente
     */
    @GetMapping("/me")
    public ResponseEntity<?> getUtenteCorrente(@RequestHeader("Authorization") String token) {
        try {
            String jwtToken = token.replace("Bearer ", "");
            Utenza utente = accessTokenUtil.verificaToken(jwtToken);
            
            return ResponseEntity.ok(Map.of(
                "id", utente.getIdUtente(),
                "nome", utente.getNome(),
                "cognome", utente.getCognome(),
                "email", utente.getEmail(),
                "ruolo", utente.getRuolo().toString(),
                "stato", utente.getStato()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Token non valido"));
        }
    }

    /**
     * Aggiorna informazioni utente
     * @param id ID dell'utente da aggiornare
     * @param utenzaData nuovi dati
     * @param token JWT token
     * @return ResponseEntity con utenza aggiornata
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> aggiornaUtenza(
            @PathVariable Integer id,
            @RequestBody Map<String, String> utenzaData,
            @RequestHeader("Authorization") String token) {
        try {
            String jwtToken = token.replace("Bearer ", "");
            Utenza utenteCorrente = accessTokenUtil.verificaToken(jwtToken);
            
            // Verifica autorizzazione (solo admin o utente stesso)
            if (!utenteCorrente.getRuolo().equals(Ruolo.Amministratore) 
                && !utenteCorrente.getIdUtente().equals(id)) {
                throw new InvalidFieldException("Non autorizzato");
            }
            
            // Verifica esistenza utente usando il metodo del DAO
            if (!utenzaDAO.existsByIdUtente(id)) {
                throw new InvalidFieldException("Utente non trovato");
            }
            
            // Cerca utente da aggiornare
            Optional<Utenza> utenzaOpt = utenzaDAO.findById(id);
            Utenza utenza = utenzaOpt.get();
            
            // Aggiorna campi se presenti
            if (utenzaData.containsKey("nome")) {
                utenza.setNome(utenzaData.get("nome"));
            }
            if (utenzaData.containsKey("cognome")) {
                utenza.setCognome(utenzaData.get("cognome"));
            }
            if (utenzaData.containsKey("email")) {
                String nuovaEmail = utenzaData.get("email");
                // Verifica che la nuova email non sia già usata
                Optional<Utenza> emailEsistente = utenzaDAO.findByEmail(nuovaEmail);
                if (emailEsistente.isPresent() && !emailEsistente.get().getIdUtente().equals(id)) {
                    throw new InvalidFieldException("Email già in uso");
                }
                utenza.setEmail(nuovaEmail);
            }
            if (utenzaData.containsKey("password")) {
                String hashedPassword = passwordUtil.HashPassword(utenzaData.get("password"));
                utenza.setPassword(hashedPassword);
            }
            
            // Salva modifiche
            Utenza utenzaAggiornata = utenzaDAO.save(utenza);
            
            return ResponseEntity.ok(Map.of(
                "message", "Utenza aggiornata con successo",
                "utenza", Map.of(
                    "id", utenzaAggiornata.getIdUtente(),
                    "nome", utenzaAggiornata.getNome(),
                    "cognome", utenzaAggiornata.getCognome(),
                    "email", utenzaAggiornata.getEmail()
                )
            ));
        } catch (InvalidFieldException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Errore durante l'aggiornamento"));
        }
    }

    /**
     * Disattiva un'utenza (soft delete)
     * @param id ID dell'utenza da disattivare
     * @param token JWT token
     * @return ResponseEntity con messaggio di conferma
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> disattivaUtenza(
            @PathVariable Integer id,
            @RequestHeader("Authorization") String token) {
        try {
            String jwtToken = token.replace("Bearer ", "");
            Utenza utenteCorrente = accessTokenUtil.verificaToken(jwtToken);
            
            // Solo amministratori possono disattivare utenti
            if (!utenteCorrente.getRuolo().equals(Ruolo.Amministratore)) {
                throw new InvalidFieldException("Solo gli amministratori possono disattivare utenti");
            }
            
            // Verifica esistenza
            if (!utenzaDAO.existsByIdUtente(id)) {
                throw new InvalidFieldException("Utente non trovato");
            }
            
            // Cerca utente
            Optional<Utenza> utenzaOpt = utenzaDAO.findById(id);
            Utenza utenza = utenzaOpt.get();
            
            // Disattiva (soft delete)
            utenza.setStato(false);
            utenzaDAO.save(utenza);
            
            return ResponseEntity.ok(Map.of(
                "message", "Utenza disattivata con successo"
            ));
        } catch (InvalidFieldException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Errore durante la disattivazione"));
        }
    }

    @PatchMapping("/{id}/riattiva")
    public ResponseEntity<?> riattivaUtenza(
            @PathVariable Integer id,
            @RequestHeader("Authorization") String token) {
        try {
            String jwtToken = token.replace("Bearer ", "");
            Utenza utenteCorrente = accessTokenUtil.verificaToken(jwtToken);
            
            // Solo amministratori possono riattivare utenti
            if (!utenteCorrente.getRuolo().equals(Ruolo.Amministratore)) {
                throw new InvalidFieldException("Solo gli amministratori possono riattivare utenti");
            }
            
            // Verifica esistenza
            if (!utenzaDAO.existsByIdUtente(id)) {
                throw new InvalidFieldException("Utente non trovato");
            }
            
            // Cerca utente
            Optional<Utenza> utenzaOpt = utenzaDAO.findById(id);
            Utenza utenza = utenzaOpt.get();
            
            // Riattiva
            utenza.setStato(true);
            utenzaDAO.save(utenza);
            
            return ResponseEntity.ok(Map.of(
                "message", "Utenza riattivata con successo"
            ));
        } catch (InvalidFieldException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Errore durante la riattivazione"));
        }
    }
}
