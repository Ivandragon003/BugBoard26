package it.unina.bugboard.controller;

import it.unina.bugboard.dao.UtenzaDAO;
import it.unina.bugboard.model.Ruolo;
import it.unina.bugboard.model.Utenza;
import it.unina.bugboard.exception.InvalidFieldException;
import it.unina.bugboard.util.AccessTokenUtil;
import it.unina.bugboard.util.PasswordUtil;
import it.unina.bugboard.util.ValidationUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/utenza")
public class UtenzaController {

	private static final String EMAIL_KEY = "email";
	private static final String PASSWORD_KEY = "password";
	private static final String NOME_KEY = "nome";
	private static final String COGNOME_KEY = "cognome";
	private static final String RUOLO_KEY = "ruolo";
	private static final String STATO_KEY = "stato";
	private static final String ID_KEY = "id";
	private static final String MESSAGE_KEY = "message";
	private static final String UTENTE_KEY = "utente";
	private static final String UTENZA_KEY = "utenza";

	@Autowired
	private UtenzaDAO utenzaDAO;

	@Autowired
	private AccessTokenUtil accessTokenUtil;

	@Autowired
	private PasswordUtil passwordUtil;

	@Autowired
	private ValidationUtil validationUtil;

	@PostMapping("/login")
	public Map<String, Object> login(@RequestBody Map<String, String> credentials) {
		String email = credentials.get(EMAIL_KEY);
		String password = credentials.get(PASSWORD_KEY);
		validationUtil.validaEmailFormat(email);
		Utenza utenza = utenzaDAO.findByEmail(email)
				.orElseThrow(() -> new InvalidFieldException("Credenziali non valide"));

		if (Boolean.FALSE.equals(utenza.getStato())) {
			throw new InvalidFieldException("Account disattivato");
		}

		if (!passwordUtil.checkPassword(password, utenza.getPassword())) {
			throw new InvalidFieldException("Credenziali non valide");
		}

		String token = accessTokenUtil.generaToken(utenza);
		return Map.of(MESSAGE_KEY, "Login effettuato con successo", "token", token, UTENTE_KEY,
				Map.of(ID_KEY, utenza.getIdUtente(), NOME_KEY, utenza.getNome(), COGNOME_KEY, utenza.getCognome(),
						EMAIL_KEY, utenza.getEmail(), RUOLO_KEY, utenza.getRuolo().toString()));
	}

	@PostMapping("/crea")
	public Map<String, Object> creaUtenza(@RequestBody Map<String, String> utenzaData,
			@RequestHeader("Authorization") String token) {
		Utenza creatore = accessTokenUtil.verificaToken(token.replace("Bearer ", ""));
		if (Boolean.FALSE.equals(creatore.getStato())) {
			throw new InvalidFieldException("Account disattivato. Non puoi eseguire questa operazione");
		}

		if (!creatore.getRuolo().equals(Ruolo.Amministratore)) {
			throw new InvalidFieldException("Solo gli amministratori possono creare nuove utenze");
		}

		String nome = utenzaData.get(NOME_KEY);
		String cognome = utenzaData.get(COGNOME_KEY);
		String email = utenzaData.get(EMAIL_KEY);
		String password = utenzaData.get(PASSWORD_KEY);
		String ruoloStr = utenzaData.get(RUOLO_KEY);
		
		validationUtil.validaNomeCognome(nome, NOME_KEY);
		validationUtil.validaNomeCognome(cognome, COGNOME_KEY);
		validationUtil.validaPassword(password);
		validationUtil.validaUniqueEmail(email);
		
		ruoloStr = ruoloStr.substring(0, 1).toUpperCase() + ruoloStr.substring(1).toLowerCase();
		Ruolo ruolo = Ruolo.valueOf(ruoloStr);
		
		if (utenzaDAO.existsByEmail(email)) {
			throw new InvalidFieldException("Email già registrata");
		}

		String hashedPassword = passwordUtil.hashPassword(password);
		Utenza nuovaUtenza = new Utenza(nome, cognome, email, hashedPassword, ruolo, creatore);
		Utenza utenzaSalvata = utenzaDAO.save(nuovaUtenza);
		return Map.of(MESSAGE_KEY, "Utenza creata con successo", UTENZA_KEY,
				Map.of(ID_KEY, utenzaSalvata.getIdUtente(), NOME_KEY, utenzaSalvata.getNome(), COGNOME_KEY,
						utenzaSalvata.getCognome(), EMAIL_KEY, utenzaSalvata.getEmail(), RUOLO_KEY,
						utenzaSalvata.getRuolo().toString(), STATO_KEY, utenzaSalvata.getStato()));
	}

	@GetMapping("/me")
	public Utenza getUtenteCorrente(@RequestHeader("Authorization") String token) {
		Utenza utente = accessTokenUtil.verificaToken(token.replace("Bearer ", ""));
		if (Boolean.FALSE.equals(utente.getStato())) {
			throw new InvalidFieldException("Account disattivato");
		}

		return utente;
	}

	@PutMapping("/modifica")
	public Map<String, Object> modificaProfilo(@RequestBody Map<String, String> datiModifica,
			@RequestHeader("Authorization") String token) {
		Utenza utenteCorrente = accessTokenUtil.verificaToken(token.replace("Bearer ", ""));
		if (Boolean.FALSE.equals(utenteCorrente.getStato())) {
			throw new InvalidFieldException("Account disattivato. Non puoi modificare il profilo");
		}

		String nuovaPassword = datiModifica.get(PASSWORD_KEY);
		if (nuovaPassword == null || nuovaPassword.trim().isEmpty()) {
			throw new InvalidFieldException("La password non può essere vuota");
		}

		utenteCorrente.setPassword(passwordUtil.hashPassword(nuovaPassword));
		utenzaDAO.save(utenteCorrente);
		return Map.of(MESSAGE_KEY, "Password aggiornata con successo", UTENTE_KEY,
				Map.of(ID_KEY, utenteCorrente.getIdUtente(), EMAIL_KEY, utenteCorrente.getEmail(), RUOLO_KEY,
						utenteCorrente.getRuolo().toString()));
	}

	@PutMapping("/{id}")
	public Map<String, Object> aggiornaUtenza(@PathVariable Integer id, @RequestBody Map<String, String> utenzaData,
			@RequestHeader("Authorization") String token) {
		Utenza utenteCorrente = accessTokenUtil.verificaToken(token.replace("Bearer ", ""));
		if (Boolean.FALSE.equals(utenteCorrente.getStato())) {
			throw new InvalidFieldException("Account disattivato. Non puoi eseguire questa operazione");
		}

		if (!utenteCorrente.getRuolo().equals(Ruolo.Amministratore)) {
			throw new InvalidFieldException("Solo gli amministratori possono modificare gli utenti");
		}

		Utenza utenzaDaModificare = utenzaDAO.findById(id)
				.orElseThrow(() -> new InvalidFieldException("Utente non trovato"));

		if (utenzaDaModificare.getRuolo().equals(Ruolo.Amministratore)
				&& !utenzaDaModificare.getIdUtente().equals(utenteCorrente.getIdUtente())) {
			throw new InvalidFieldException("Non puoi modificare altri amministratori");
		}

		if (!utenzaData.containsKey(RUOLO_KEY)) {
			throw new InvalidFieldException("Il campo ruolo è obbligatorio");
		}

		if (utenzaDaModificare.getRuolo().equals(Ruolo.Amministratore)) {
			throw new InvalidFieldException("Non puoi cambiare il ruolo di un amministratore");
		}

		String nuovoRuoloStr = utenzaData.get(RUOLO_KEY);
		if (nuovoRuoloStr == null || nuovoRuoloStr.trim().isEmpty()) {
			throw new InvalidFieldException("Il ruolo non può essere vuoto");
		}

		nuovoRuoloStr = nuovoRuoloStr.substring(0, 1).toUpperCase() + nuovoRuoloStr.substring(1).toLowerCase();

		try {
			Ruolo nuovoRuolo = Ruolo.valueOf(nuovoRuoloStr);

			if (nuovoRuolo.equals(Ruolo.Amministratore)) {
				throw new InvalidFieldException(
						"Non puoi promuovere un utente ad amministratore tramite questa funzione");
			}

			utenzaDaModificare.setRuolo(nuovoRuolo);
		} catch (IllegalArgumentException e) {
			throw new InvalidFieldException("Ruolo non valido. Valori consentiti: Utente, Amministratore");
		}

		Utenza utenzaAggiornata = utenzaDAO.save(utenzaDaModificare);
		return Map.of(MESSAGE_KEY, "Ruolo utente aggiornato con successo", UTENZA_KEY,
				Map.of(ID_KEY, utenzaAggiornata.getIdUtente(), NOME_KEY, utenzaAggiornata.getNome(), COGNOME_KEY,
						utenzaAggiornata.getCognome(), EMAIL_KEY, utenzaAggiornata.getEmail(), RUOLO_KEY,
						utenzaAggiornata.getRuolo().toString(), STATO_KEY, utenzaAggiornata.getStato()));
	}

	@DeleteMapping("/{id}")
	public Map<String, String> disattivaUtenza(@PathVariable Integer id, @RequestHeader("Authorization") String token) {
		Utenza utenteCorrente = accessTokenUtil.verificaToken(token.replace("Bearer ", ""));
		if (Boolean.FALSE.equals(utenteCorrente.getStato())) {
			throw new InvalidFieldException("Account disattivato. Non puoi eseguire questa operazione");
		}

		if (!utenteCorrente.getRuolo().equals(Ruolo.Amministratore)) {
			throw new InvalidFieldException("Solo gli amministratori possono disattivare utenti");
		}

		if (utenteCorrente.getIdUtente().equals(id)) {
			throw new InvalidFieldException("Non puoi disattivare il tuo stesso account");
		}

		Utenza utenza = utenzaDAO.findById(id).orElseThrow(() -> new InvalidFieldException("Utente non trovato"));
		utenza.setStato(false);
		utenzaDAO.save(utenza);
		return Map.of(MESSAGE_KEY, "Utenza disattivata con successo");
	}

	@PatchMapping("/{id}/riattiva")
	public Map<String, String> riattivaUtenza(@PathVariable Integer id, @RequestHeader("Authorization") String token) {
		Utenza utenteCorrente = accessTokenUtil.verificaToken(token.replace("Bearer ", ""));
		if (Boolean.FALSE.equals(utenteCorrente.getStato())) {
			throw new InvalidFieldException("Account disattivato. Non puoi eseguire questa operazione");
		}

		if (!utenteCorrente.getRuolo().equals(Ruolo.Amministratore)) {
			throw new InvalidFieldException("Solo gli amministratori possono riattivare utenti");
		}

		Utenza utenza = utenzaDAO.findById(id).orElseThrow(() -> new InvalidFieldException("Utente non trovato"));
		utenza.setStato(true);
		utenzaDAO.save(utenza);
		return Map.of(MESSAGE_KEY, "Utenza riattivata con successo");
	}

	@PatchMapping("/{id}/stato")
	public Map<String, Object> cambiaStatoUtenza(@PathVariable(value = "id") Integer id,
			@RequestBody Map<String, Boolean> data, @RequestHeader("Authorization") String token) {

		Utenza utenteCorrente = accessTokenUtil.verificaToken(token.replace("Bearer ", ""));
		if (Boolean.FALSE.equals(utenteCorrente.getStato())) {
			throw new InvalidFieldException("Account disattivato. Non puoi eseguire questa operazione");
		}

		if (!utenteCorrente.getRuolo().equals(Ruolo.Amministratore)) {
			throw new InvalidFieldException("Solo gli amministratori possono cambiare lo stato degli utenti");
		}

		if (utenteCorrente.getIdUtente().equals(id)) {
			throw new InvalidFieldException("Non puoi cambiare lo stato del tuo stesso account");
		}

		Utenza utenza = utenzaDAO.findById(id).orElseThrow(() -> new InvalidFieldException("Utente non trovato"));
		Boolean nuovoStato = data.get(STATO_KEY);
		if (nuovoStato == null) {
			throw new InvalidFieldException("Stato non specificato");
		}

		utenza.setStato(nuovoStato);
		utenzaDAO.save(utenza);
		return Map.of(MESSAGE_KEY,
				Boolean.TRUE.equals(nuovoStato) ? "Utenza attivata con successo" : "Utenza disattivata con successo",
				UTENTE_KEY, Map.of(ID_KEY, utenza.getIdUtente(), STATO_KEY, utenza.getStato()));
	}

	@GetMapping("/lista")
	public List<Map<String, Object>> getListaUtenti(@RequestHeader("Authorization") String token,
			@RequestParam(value = "attivi", required = false) Boolean attivi) {
		Utenza utenteCorrente = accessTokenUtil.verificaToken(token.replace("Bearer ", ""));
		if (Boolean.FALSE.equals(utenteCorrente.getStato())) {
			throw new InvalidFieldException("Account disattivato. Non puoi visualizzare la lista utenti");
		}

		if (!utenteCorrente.getRuolo().equals(Ruolo.Amministratore)) {
			throw new InvalidFieldException("Solo gli amministratori possono visualizzare la lista utenti");
		}

		return utenzaDAO.findAll().stream().filter(utenza -> attivi == null || utenza.getStato().equals(attivi))
				.map(utenza -> {
					Map<String, Object> utenteMap = new HashMap<>();
					utenteMap.put("idUtente", utenza.getIdUtente());
					utenteMap.put(ID_KEY, utenza.getIdUtente());
					utenteMap.put(NOME_KEY, utenza.getNome());
					utenteMap.put(COGNOME_KEY, utenza.getCognome());
					utenteMap.put(EMAIL_KEY, utenza.getEmail());
					utenteMap.put(RUOLO_KEY, utenza.getRuolo().toString());
					utenteMap.put(STATO_KEY, utenza.getStato());
					return utenteMap;
				}).collect(java.util.stream.Collectors.toCollection(ArrayList::new));
	}

	@GetMapping("/lista-attivi")
	public List<Map<String, Object>> getListaUtentiAttivi(@RequestHeader("Authorization") String token) {
		Utenza utenteCorrente = accessTokenUtil.verificaToken(token.replace("Bearer ", ""));
		if (Boolean.FALSE.equals(utenteCorrente.getStato())) {
			throw new InvalidFieldException("Account disattivato. Non puoi visualizzare la lista utenti");
		}

		return utenzaDAO.findAll().stream().filter(Utenza::getStato).map(utenza -> {
			Map<String, Object> utenteMap = new HashMap<>();
			utenteMap.put("idUtente", utenza.getIdUtente());
			utenteMap.put(ID_KEY, utenza.getIdUtente());
			utenteMap.put(NOME_KEY, utenza.getNome());
			utenteMap.put(COGNOME_KEY, utenza.getCognome());
			utenteMap.put(EMAIL_KEY, utenza.getEmail());
			utenteMap.put(RUOLO_KEY, utenza.getRuolo().toString());
			return utenteMap;
		}).collect(java.util.stream.Collectors.toCollection(ArrayList::new));
	}
}