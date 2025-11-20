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
            
            validationUtil.validaEmailFormat(email);
            
            Ruolo ruolo = Ruolo.valueOf(ruoloStr.toUpperCase());
            
            Optional<Utenza> utenzaOpt = utenzaDAO.findByEmail(email);
            
            if (utenzaOpt.isEmpty()) {
                throw new InvalidFieldException("Credenziali non valide");
            }
            
            Utenza utenza = utenzaOpt.get();
            
            if (!utenza.getRuolo().equals(ruolo)) {
                throw new InvalidFieldException("Credenziali non valide");
            }
            
            if (!utenza.getStato()) {
                throw new InvalidFieldException("Account disattivato");
            }
            
            if (!passwordUtil.HashPassword(password).equals(utenza.getPassword())) {
                throw new InvalidFieldException("Credenziali non valide");
            }
            
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

    @PostMapping("/crea")
    public ResponseEntity<?> creaUtenza(
            @RequestBody Map<String, Object> utenzaData,
            @RequestHeader("Authorization") String token) {
        try {
            String jwtToken = token.replace("Bearer ", "");
            Utenza creatore = accessTokenUtil.verificaToken(jwtToken);
            
            if (!creatore.getStato()) {
                throw new InvalidFieldException("Account creatore non attivo");
            }
            
            String nome = (String) utenzaData.get("nome");
            String cognome = (String) utenzaData.get("cognome");
            String email = (String) utenzaData.get("email");
            String password = (String) utenzaData.get("password");
            Ruolo ruolo = Ruolo.valueOf(((String) utenzaData.get("ruolo")).toUpperCase());
            
            validationUtil.validaUniqueEmail(email);
            
            if (utenzaDAO.existsByEmail(email)) {
                throw new InvalidFieldException("Email già registrata");
            }
            
            String hashedPassword = passwordUtil.HashPassword(password);
            
            Utenza nuovaUtenza = new Utenza(nome, cognome, email, hashedPassword, ruolo, creatore);
            
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

    @PostMapping("/recupera-password")
    public ResponseEntity<?> recuperaPassword(@RequestBody Map<String, String> data) {
        try {
            String email = data.get("email");
            
            validationUtil.validaEmailFormat(email);
            
            Optional<Utenza> utenzaOpt = utenzaDAO.findByEmail(email);
            
            if (utenzaOpt.isEmpty()) {
                throw new InvalidFieldException("Email non trovata");
            }
            
            Utenza utenza = utenzaOpt.get();
            
            String nuovaPassword = passwordUtil.generaPassword();
            String hashedPassword = passwordUtil.HashPassword(nuovaPassword);
            
            utenza.setPassword(hashedPassword);
            utenzaDAO.save(utenza);
            
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

    @PutMapping("/{id}")
    public ResponseEntity<?> aggiornaUtenza(
            @PathVariable Integer id,
            @RequestBody Map<String, String> utenzaData,
            @RequestHeader("Authorization") String token) {
        try {
            String jwtToken = token.replace("Bearer ", "");
            Utenza utenteCorrente = accessTokenUtil.verificaToken(jwtToken);
            
            if (!utenteCorrente.getRuolo().equals(Ruolo.Amministratore) 
                && !utenteCorrente.getIdUtente().equals(id)) {
                throw new InvalidFieldException("Non autorizzato");
            }
            
            if (!utenzaDAO.existsByIdUtente(id)) {
                throw new InvalidFieldException("Utente non trovato");
            }
            
            Optional<Utenza> utenzaOpt = utenzaDAO.findById(id);
            Utenza utenza = utenzaOpt.get();
            
            if (utenzaData.containsKey("nome")) {
                utenza.setNome(utenzaData.get("nome"));
            }
            if (utenzaData.containsKey("cognome")) {
                utenza.setCognome(utenzaData.get("cognome"));
            }
            if (utenzaData.containsKey("email")) {
                String nuovaEmail = utenzaData.get("email");
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

    @DeleteMapping("/{id}")
    public ResponseEntity<?> disattivaUtenza(
            @PathVariable Integer id,
            @RequestHeader("Authorization") String token) {
        try {
            String jwtToken = token.replace("Bearer ", "");
            Utenza utenteCorrente = accessTokenUtil.verificaToken(jwtToken);
            
            if (!utenteCorrente.getRuolo().equals(Ruolo.Amministratore)) {
                throw new InvalidFieldException("Solo gli amministratori possono disattivare utenti");
            }
            
            if (!utenzaDAO.existsByIdUtente(id)) {
                throw new InvalidFieldException("Utente non trovato");
            }
            
            Optional<Utenza> utenzaOpt = utenzaDAO.findById(id);
            Utenza utenza = utenzaOpt.get();
            
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
            
            if (!utenteCorrente.getRuolo().equals(Ruolo.Amministratore)) {
                throw new InvalidFieldException("Solo gli amministratori possono riattivare utenti");
            }
            
            if (!utenzaDAO.existsByIdUtente(id)) {
                throw new InvalidFieldException("Utente non trovato");
            }
            
            Optional<Utenza> utenzaOpt = utenzaDAO.findById(id);
            Utenza utenza = utenzaOpt.get();
            
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
