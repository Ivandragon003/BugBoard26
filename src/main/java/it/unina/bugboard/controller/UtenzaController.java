package it.unina.bugboard.controller;

import it.unina.bugboard.dao.UtenzaDAO;
import it.unina.bugboard.model.Ruolo;
import it.unina.bugboard.model.Utenza;
import it.unina.bugboard.exception.InvalidFieldException;
import it.unina.bugboard.exception.NotFoundException;
import it.unina.bugboard.exception.InvalidInputException;
import it.unina.bugboard.util.AccessTokenUtil;
import it.unina.bugboard.util.PasswordUtil;
import it.unina.bugboard.util.EmailUtil;
import it.unina.bugboard.util.ValidationUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;


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
        return Map.of("message", "Login effettuato con successo", "token", token, "utente",
            Map.of("id", utenza.getIdUtente(), "nome", utenza.getNome(), "cognome", utenza.getCognome(), "email",
                utenza.getEmail(), "ruolo", utenza.getRuolo().toString()));
    }

    // ---------------- CREA UTENZA (solo admin) ----------------
    @PostMapping("/crea")
    public Map<String, Object> creaUtenza(@RequestBody Map<String, String> utenzaData,
                                          @RequestHeader("Authorization") String token) {
        Utenza creatore = accessTokenUtil.verificaToken(token.replace("Bearer ", ""));
        if (!creatore.getStato()) {
            throw new InvalidFieldException("Account creatore non attivo");
        }

        if (!creatore.getRuolo().equals(Ruolo.Amministratore)) {
            throw new InvalidFieldException("Solo gli amministratori possono creare nuove utenze");
        }

        String nome = utenzaData.get("nome");
        String cognome = utenzaData.get("cognome");
        String email = utenzaData.get("email");
        String password = utenzaData.get("password");
        String ruoloStr = utenzaData.get("ruolo");
        ruoloStr = ruoloStr.substring(0, 1).toUpperCase() + ruoloStr.substring(1).toLowerCase();
        Ruolo ruolo = Ruolo.valueOf(ruoloStr);

        validationUtil.validaUniqueEmail(email);
        if (utenzaDAO.existsByEmail(email)) {
            throw new InvalidFieldException("Email già registrata");
        }

        String hashedPassword = passwordUtil.hashPassword(password);
        Utenza nuovaUtenza = new Utenza(nome, cognome, email, hashedPassword, ruolo, creatore);
        Utenza utenzaSalvata = utenzaDAO.save(nuovaUtenza);

        try {
            emailUtil.sendEmail(email, "Nuova utenza BugBoard",
                "La tua utenza è stata creata.\nEmail: " + email + "\nPassword: " + password);
        } catch (Exception e) {
            System.out.println("=== EMAIL NON INVIATA (modalità sviluppo) ===");
            System.out.println("Email: " + email);
            System.out.println("Password: " + password);
            System.out.println("===========================================");
        }

        
        return Map.of("message", "Utenza creata con successo", "utenza",
            Map.of("id", utenzaSalvata.getIdUtente(), "nome", utenzaSalvata.getNome(), "cognome",
                utenzaSalvata.getCognome(), "email", utenzaSalvata.getEmail(), "ruolo",
                utenzaSalvata.getRuolo().toString(), "stato", utenzaSalvata.getStato()));
    }

    //---------------- RECUPERO PASSWORD ----------------
    @PostMapping("/recupera-password")
    public Map<String, String> recuperaPassword(@RequestBody Map<String, String> data) {
        String email = data.get("email");
        
        validationUtil.validaEmailFormat(email);
        Utenza utenza = utenzaDAO.findByEmail(email)
            .orElseThrow(() -> new InvalidFieldException("Email non trovata"));

        String nuovaPassword = passwordUtil.generaPassword();
        utenza.setPassword(passwordUtil.hashPassword(nuovaPassword));
        utenzaDAO.save(utenza);

        emailUtil.sendRecuperoPassword(email, nuovaPassword);
        return Map.of("message", "Email di recupero password inviata con successo");
    }

    // ---------------- GET UTENTE CORRENTE ----------------
    @GetMapping("/me")
    public Utenza getUtenteCorrente(@RequestHeader("Authorization") String token) {
        return accessTokenUtil.verificaToken(token.replace("Bearer ", ""));
    }

    // ---------------- MODIFICA PROFILO (password) ----------------
    @PutMapping("/modifica")
    public Map<String, Object> modificaProfilo(
        @RequestBody Map<String, String> datiModifica,
        @RequestHeader("Authorization") String token
    ) {
        Utenza utenteCorrente = accessTokenUtil.verificaToken(token.replace("Bearer ", ""));
        
        if (!utenteCorrente.getStato()) {
            throw new InvalidFieldException("Account disattivato");
        }
        
        String nuovaPassword = datiModifica.get("password");
        if (nuovaPassword == null || nuovaPassword.trim().isEmpty()) {
            throw new InvalidFieldException("La password non può essere vuota");
        }
        
        utenteCorrente.setPassword(passwordUtil.hashPassword(nuovaPassword));
        utenzaDAO.save(utenteCorrente);
        
        return Map.of(
            "message", "Password aggiornata con successo",
            "utente", Map.of(
                "id", utenteCorrente.getIdUtente(),
                "email", utenteCorrente.getEmail(),
                "ruolo", utenteCorrente.getRuolo().toString()
            )
        );
    }

    // ---------------- AGGIORNA UTENZA (solo admin) ----------------
    @PutMapping("/{id}")
    public Utenza modificaUtenza(@PathVariable Integer id, @RequestBody Map<String, Object> payload) {
        Utenza utenza = utenzaDAO.findById(id)
                .orElseThrow(() -> new NotFoundException("Utente non trovato con id: " + id));

        // ✅ IMPEDISCI IL DOWNGRADE DA AMMINISTRATORE A UTENTE
        if (utenza.getRuolo() == Ruolo.Amministratore && payload.containsKey("ruolo")) {
            String nuovoRuolo = (String) payload.get("ruolo");
            if ("Utente".equalsIgnoreCase(nuovoRuolo)) {
                throw new InvalidInputException("Non è possibile rimuovere i privilegi di amministratore. Un amministratore può solo rimanere tale.");
            }
        }

        if (payload.containsKey("nome"))
            utenza.setNome((String) payload.get("nome"));

        if (payload.containsKey("cognome"))
            utenza.setCognome((String) payload.get("cognome"));

        if (payload.containsKey("ruolo"))
            utenza.setRuolo(parseRuolo((String) payload.get("ruolo")));

        return utenzaDAO.save(utenza);
    }


    // ---------------- DISATTIVA UTENZA (solo admin) ----------------
    @DeleteMapping("/{id}")
    public Map<String, String> disattivaUtenza(@PathVariable Integer id, 
                                                @RequestHeader("Authorization") String token) {
        Utenza utenteCorrente = accessTokenUtil.verificaToken(token.replace("Bearer ", ""));
        if (!utenteCorrente.getRuolo().equals(Ruolo.Amministratore)) {
            throw new InvalidFieldException("Solo gli amministratori possono disattivare utenti");
        }

        // Non può disattivare se stesso
        if (utenteCorrente.getIdUtente().equals(id)) {
            throw new InvalidFieldException("Non puoi disattivare il tuo stesso account");
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
    
    // ---------------- CAMBIA STATO UTENZA (solo admin) ----------------
    @PatchMapping("/{id}/stato")
    public Map<String, Object> cambiaStatoUtenza(@PathVariable Integer id, 
                                                  @RequestBody Map<String, Boolean> data,
                                                  @RequestHeader("Authorization") String token) {
        Utenza utenteCorrente = accessTokenUtil.verificaToken(token.replace("Bearer ", ""));
        if (!utenteCorrente.getRuolo().equals(Ruolo.Amministratore)) {
            throw new InvalidFieldException("Solo gli amministratori possono cambiare lo stato degli utenti");
        }

        // Non può cambiare il proprio stato
        if (utenteCorrente.getIdUtente().equals(id)) {
            throw new InvalidFieldException("Non puoi cambiare lo stato del tuo stesso account");
        }

        Utenza utenza = utenzaDAO.findById(id)
            .orElseThrow(() -> new InvalidFieldException("Utente non trovato"));
        
        Boolean nuovoStato = data.get("stato");
        if (nuovoStato == null) {
            throw new InvalidFieldException("Stato non specificato");
        }
        
        utenza.setStato(nuovoStato);
        utenzaDAO.save(utenza);

        return Map.of(
            "message", nuovoStato ? "Utenza attivata con successo" : "Utenza disattivata con successo",
            "utente", Map.of(
                "id", utenza.getIdUtente(),
                "stato", utenza.getStato()
            )
        );
    }
    
    // ---------------- LISTA UTENTI (solo admin) - Include anche disattivati ----------------
    @GetMapping("/lista")
    public List<Map<String, Object>> getListaUtenti(
            @RequestHeader("Authorization") String token,
            @RequestParam(required = false) Boolean attivi) {
        Utenza utenteCorrente = accessTokenUtil.verificaToken(token.replace("Bearer ", ""));
        
        if (!utenteCorrente.getRuolo().equals(Ruolo.Amministratore)) {
            throw new InvalidFieldException("Solo gli amministratori possono visualizzare la lista utenti");
        }

        return utenzaDAO.findAll().stream()
            .filter(utenza -> attivi == null || utenza.getStato().equals(attivi))
            .map(utenza -> {
                Map<String, Object> utenteMap = new java.util.HashMap<>();
                utenteMap.put("idUtente", utenza.getIdUtente());
                utenteMap.put("id", utenza.getIdUtente());
                utenteMap.put("nome", utenza.getNome());
                utenteMap.put("cognome", utenza.getCognome());
                utenteMap.put("email", utenza.getEmail());
                utenteMap.put("ruolo", utenza.getRuolo().toString());
                utenteMap.put("stato", utenza.getStato());
                return utenteMap;
            })
            .collect(Collectors.toList());
    }

    // ---------------- LISTA UTENTI ATTIVI  ----------------
    @GetMapping("/lista-attivi")
    public List<Map<String, Object>> getListaUtentiAttivi(@RequestHeader("Authorization") String token) {
        accessTokenUtil.verificaToken(token.replace("Bearer ", ""));

        return utenzaDAO.findAll().stream()
            .filter(Utenza::getStato)
            .map(utenza -> {
                Map<String, Object> utenteMap = new java.util.HashMap<>();
                utenteMap.put("idUtente", utenza.getIdUtente());
                utenteMap.put("id", utenza.getIdUtente());
                utenteMap.put("nome", utenza.getNome());
                utenteMap.put("cognome", utenza.getCognome());
                utenteMap.put("email", utenza.getEmail());
                utenteMap.put("ruolo", utenza.getRuolo().toString());
                return utenteMap;
            })
            .collect(Collectors.toList());
    }

    // ---------------- METODO HELPER: PARSE RUOLO ----------------
    private Ruolo parseRuolo(String value) {
        if (value == null)
            throw new InvalidInputException("Ruolo non può essere null");

        return switch (value.toLowerCase()) {
            case "utente" -> Ruolo.Utente;
            case "amministratore" -> Ruolo.Amministratore;
            default -> throw new InvalidInputException("Ruolo non valido: " + value);
        };
    }
}
