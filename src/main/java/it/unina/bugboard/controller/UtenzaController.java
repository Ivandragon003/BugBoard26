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

// ---------------- LOGIN ----------------
@PostMapping("/login")
public Map<String, Object> login(@RequestBody Map<String, String> credentials) {
    String email = credentials.get("email");
    String password = credentials.get("password");

    validationUtil.validaEmailFormat(email);

    Utenza utenza = utenzaDAO.findByEmail(email)
            .orElseThrow(() -> new InvalidFieldException("Credenziali non valide"));

    if (!utenza.getStato()) {
        throw new InvalidFieldException("Account disattivato");
    }

    if (!passwordUtil.checkPassword(password, utenza.getPassword())) {
        throw new InvalidFieldException("Credenziali non valide");
    }


    String token = accessTokenUtil.generaToken(utenza);

    return Map.of(
        "message", "Login effettuato con successo",
        "token", token,
        "utente", Map.of(
            "id", utenza.getIdUtente(),
            "nome", utenza.getNome(),
            "cognome", utenza.getCognome(),
            "email", utenza.getEmail(),
            "ruolo", utenza.getRuolo().toString()
        )
    );
}

// ---------------- CREA UTENZA (solo admin) ----------------
@PostMapping("/crea")
public Map<String, Object> creaUtenza(
        @RequestBody Map<String, Object> utenzaData,
        @RequestHeader("Authorization") String token) {

    Utenza creatore = accessTokenUtil.verificaToken(token.replace("Bearer ", ""));

    if (!creatore.getStato()) {
        throw new InvalidFieldException("Account creatore non attivo");
    }
    if (!creatore.getRuolo().equals(Ruolo.Amministratore)) {
        throw new InvalidFieldException("Solo gli amministratori possono creare nuove utenze");
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

    String hashedPassword = passwordUtil.hashPassword(password);

    Utenza nuovaUtenza = new Utenza(nome, cognome, email, hashedPassword, ruolo, creatore);
    Utenza utenzaSalvata = utenzaDAO.save(nuovaUtenza);

    emailUtil.sendEmail(email, "Nuova utenza BugBoard",
            "La tua utenza è stata creata.\nEmail: " + email + "\nPassword: " + password);

    return Map.of(
            "message", "Utenza creata con successo",
            "utenza", Map.of(
                    "id", utenzaSalvata.getIdUtente(),
                    "nome", utenzaSalvata.getNome(),
                    "cognome", utenzaSalvata.getCognome(),
                    "email", utenzaSalvata.getEmail(),
                    "ruolo", utenzaSalvata.getRuolo().toString(),
                    "stato", utenzaSalvata.getStato()
            )
    );
}

// ---------------- RECUPERO PASSWORD ----------------
@PostMapping("/recupera-password")
public Map<String, String> recuperaPassword(@RequestBody Map<String, String> data) {
    String email = data.get("email");
    validationUtil.validaEmailFormat(email);

    Utenza utenza = utenzaDAO.findByEmail(email)
            .orElseThrow(() -> new InvalidFieldException("Email non trovata"));

    String nuovaPassword = passwordUtil.generaPassword();
    utenza.setPassword(passwordUtil.hashPassword(nuovaPassword));
    utenzaDAO.save(utenza);

    emailUtil.sendEmail(email, "Recupero Password - BugBoard",
            "La tua nuova password temporanea è: " + nuovaPassword);

    return Map.of("message", "Email di recupero password inviata con successo");
}

// ---------------- GET UTENTE CORRENTE ----------------
@GetMapping("/me")
public Utenza getUtenteCorrente(@RequestHeader("Authorization") String token) {
    return accessTokenUtil.verificaToken(token.replace("Bearer ", ""));
}

// ---------------- AGGIORNA UTENZA ----------------
@PutMapping("/{id}")
public Map<String, Object> aggiornaUtenza(
        @PathVariable Integer id,
        @RequestBody Map<String, String> utenzaData,
        @RequestHeader("Authorization") String token) {

    Utenza utenteCorrente = accessTokenUtil.verificaToken(token.replace("Bearer ", ""));

    if (!utenteCorrente.getRuolo().equals(Ruolo.Amministratore) && !utenteCorrente.getIdUtente().equals(id)) {
        throw new InvalidFieldException("Non autorizzato");
    }

    Utenza utenza = utenzaDAO.findById(id)
            .orElseThrow(() -> new InvalidFieldException("Utente non trovato"));

    if (utenzaData.containsKey("nome")) utenza.setNome(utenzaData.get("nome"));
    if (utenzaData.containsKey("cognome")) utenza.setCognome(utenzaData.get("cognome"));
    if (utenzaData.containsKey("email")) {
        String nuovaEmail = utenzaData.get("email");
        Optional<Utenza> emailEsistente = utenzaDAO.findByEmail(nuovaEmail);
        if (emailEsistente.isPresent() && !emailEsistente.get().getIdUtente().equals(id)) {
            throw new InvalidFieldException("Email già in uso");
        }
        utenza.setEmail(nuovaEmail);
    }
    if (utenzaData.containsKey("password")) utenza.setPassword(passwordUtil.hashPassword(utenzaData.get("password")));

    Utenza utenzaAggiornata = utenzaDAO.save(utenza);

    return Map.of(
            "message", "Utenza aggiornata con successo",
            "utenza", Map.of(
                    "id", utenzaAggiornata.getIdUtente(),
                    "nome", utenzaAggiornata.getNome(),
                    "cognome", utenzaAggiornata.getCognome(),
                    "email", utenzaAggiornata.getEmail()
            )
    );
}

// ---------------- DISATTIVA UTENZA (solo admin) ----------------
@DeleteMapping("/{id}")
public Map<String, String> disattivaUtenza(@PathVariable Integer id,
                                           @RequestHeader("Authorization") String token) {
    Utenza utenteCorrente = accessTokenUtil.verificaToken(token.replace("Bearer ", ""));
    if (!utenteCorrente.getRuolo().equals(Ruolo.Amministratore)) {
        throw new InvalidFieldException("Solo gli amministratori possono disattivare utenti");
    }

    Utenza utenza = utenzaDAO.findById(id)
            .orElseThrow(() -> new InvalidFieldException("Utente non trovato"));

    utenza.setStato(false);
    utenzaDAO.save(utenza);

    return Map.of("message", "Utenza disattivata con successo");
}

// ---------------- RIATTIVA UTENZA (solo admin) ----------------
@PatchMapping("/{id}/riattiva")
public Map<String, String> riattivaUtenza(@PathVariable Integer id,
                                          @RequestHeader("Authorization") String token) {
    Utenza utenteCorrente = accessTokenUtil.verificaToken(token.replace("Bearer ", ""));
    if (!utenteCorrente.getRuolo().equals(Ruolo.Amministratore)) {
        throw new InvalidFieldException("Solo gli amministratori possono riattivare utenti");
    }

    Utenza utenza = utenzaDAO.findById(id)
            .orElseThrow(() -> new InvalidFieldException("Utente non trovato"));

    utenza.setStato(true);
    utenzaDAO.save(utenza);

    return Map.of("message", "Utenza riattivata con successo");
}


}
