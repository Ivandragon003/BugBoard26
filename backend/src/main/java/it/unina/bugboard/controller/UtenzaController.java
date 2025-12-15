package it.unina.bugboard.controller;

import it.unina.bugboard.dao.UtenzaDAO;
import it.unina.bugboard.model.Ruolo;
import it.unina.bugboard.model.Utenza;
import it.unina.bugboard.exception.InvalidFieldException;
import it.unina.bugboard.exception.UnauthorizedException;
import it.unina.bugboard.exception.NotFoundException;
import it.unina.bugboard.exception.AlreadyExistsException;
import it.unina.bugboard.util.AccessTokenUtil;
import it.unina.bugboard.util.PasswordUtil;
import it.unina.bugboard.util.ValidationUtil;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;
import java.util.HashMap;

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

	private final UtenzaDAO utenzaDAO;
	private final AccessTokenUtil accessTokenUtil;
	private final PasswordUtil passwordUtil;
	private final ValidationUtil validationUtil;

	public UtenzaController(UtenzaDAO utenzaDAO, AccessTokenUtil accessTokenUtil, PasswordUtil passwordUtil,
			ValidationUtil validationUtil) {
		this.utenzaDAO = utenzaDAO;
		this.accessTokenUtil = accessTokenUtil;
		this.passwordUtil = passwordUtil;
		this.validationUtil = validationUtil;
	}

	@PostMapping("/login")
	public Map<String, Object> login(@RequestBody Map<String, String> credentials) {
		String email = credentials.get(EMAIL_KEY);
		String password = credentials.get(PASSWORD_KEY);
		validationUtil.validaEmailFormat(email);

		Utenza utenza = utenzaDAO.findByEmail(email)
				.orElseThrow(() -> new UnauthorizedException("Credenziali non valide"));

		if (Boolean.FALSE.equals(utenza.getStato())) {
			throw new UnauthorizedException("Account disattivato");
		}

		if (!passwordUtil.checkPassword(password, utenza.getPassword())) {
			throw new UnauthorizedException("Credenziali non valide");
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

		verificaAccountAttivo(creatore);
		verificaRuoloAmministratore(creatore);

		String nome = utenzaData.get(NOME_KEY);
		String cognome = utenzaData.get(COGNOME_KEY);
		String email = utenzaData.get(EMAIL_KEY);
		String password = utenzaData.get(PASSWORD_KEY);
		String ruoloStr = utenzaData.get(RUOLO_KEY);

		validationUtil.validaNomeCognome(nome, NOME_KEY);
		validationUtil.validaNomeCognome(cognome, COGNOME_KEY);
		validationUtil.validaPassword(password);
		validationUtil.validaUniqueEmail(email);

		if (utenzaDAO.existsByEmail(email)) {
			throw new AlreadyExistsException("Email già registrata");
		}

		ruoloStr = ruoloStr.substring(0, 1).toUpperCase() + ruoloStr.substring(1).toLowerCase();
		Ruolo ruolo = Ruolo.valueOf(ruoloStr);

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
		verificaAccountAttivo(utente);
		return utente;
	}

	@GetMapping("/lista")
	public List<Map<String, Object>> listaUtenti(@RequestHeader("Authorization") String token) {
		Utenza utenteCorrente = accessTokenUtil.verificaToken(token.replace("Bearer ", ""));
		verificaAccountAttivo(utenteCorrente);
		verificaRuoloAmministratore(utenteCorrente);

		List<Utenza> utenti = utenzaDAO.findAll();

		return utenti.stream()
				.map(u -> {
					Map<String, Object> utenteMap = new HashMap<>();
					utenteMap.put("idUtente", u.getIdUtente());
					utenteMap.put(NOME_KEY, u.getNome());
					utenteMap.put(COGNOME_KEY, u.getCognome());
					utenteMap.put(EMAIL_KEY, u.getEmail());
					utenteMap.put(RUOLO_KEY, u.getRuolo().toString());
					utenteMap.put(STATO_KEY, u.getStato());
					return utenteMap;
				})
				.collect(Collectors.toList());
	}

	@PutMapping("/modifica")
	public Map<String, Object> modificaProfilo(@RequestBody Map<String, String> datiModifica,
			@RequestHeader("Authorization") String token) {
		Utenza utenteCorrente = accessTokenUtil.verificaToken(token.replace("Bearer ", ""));
		verificaAccountAttivo(utenteCorrente);

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
		verificaAccountAttivo(utenteCorrente);
		verificaRuoloAmministratore(utenteCorrente);
		
		if (utenteCorrente.getIdUtente().equals(id)) {
	        throw new UnauthorizedException("Non puoi modificare il tuo stesso ruolo");
	    }
		
		Utenza utenzaDaModificare = utenzaDAO.findById(id)
				.orElseThrow(() -> new NotFoundException("Utente non trovato"));
		
		if (Boolean.FALSE.equals(utenzaDaModificare.getStato())) {
	        throw new InvalidFieldException("Non puoi modificare il ruolo di un account disattivato. Attiva prima l'account.");
	    }
		
		if (utenzaDaModificare.getRuolo().equals(Ruolo.Amministratore)
				&& !utenzaDaModificare.getIdUtente().equals(utenteCorrente.getIdUtente())) {
			throw new UnauthorizedException("Non puoi modificare altri amministratori");
		}

		if (!utenzaData.containsKey(RUOLO_KEY)) {
			throw new InvalidFieldException("Il campo ruolo è obbligatorio");
		}

		// Non puoi cambiare il ruolo di un amministratore esistente
		if (utenzaDaModificare.getRuolo().equals(Ruolo.Amministratore)) {
			throw new UnauthorizedException("Non puoi cambiare il ruolo di un amministratore");
		}

		String nuovoRuoloStr = utenzaData.get(RUOLO_KEY);

		if (nuovoRuoloStr == null || nuovoRuoloStr.trim().isEmpty()) {
			throw new InvalidFieldException("Il ruolo non può essere vuoto");
		}

		nuovoRuoloStr = nuovoRuoloStr.substring(0, 1).toUpperCase() + nuovoRuoloStr.substring(1).toLowerCase();

		Ruolo nuovoRuolo;
		if ("Utente".equals(nuovoRuoloStr)) {
			nuovoRuolo = Ruolo.Utente;
		} else if ("Amministratore".equals(nuovoRuoloStr)) {
			nuovoRuolo = Ruolo.Amministratore;
		} else {
			throw new InvalidFieldException("Ruolo non valido. Valori consentiti: Utente, Amministratore");
		}

		utenzaDaModificare.setRuolo(nuovoRuolo);
		Utenza utenzaAggiornata = utenzaDAO.save(utenzaDaModificare);

		return Map.of(MESSAGE_KEY, "Ruolo utente aggiornato con successo", UTENZA_KEY,
				Map.of(ID_KEY, utenzaAggiornata.getIdUtente(), NOME_KEY, utenzaAggiornata.getNome(), COGNOME_KEY,
						utenzaAggiornata.getCognome(), EMAIL_KEY, utenzaAggiornata.getEmail(), RUOLO_KEY,
						utenzaAggiornata.getRuolo().toString(), STATO_KEY, utenzaAggiornata.getStato()));
	}

	@DeleteMapping("/{id}")
	public Map<String, String> disattivaUtenza(@PathVariable Integer id, @RequestHeader("Authorization") String token) {
		Utenza utenteCorrente = accessTokenUtil.verificaToken(token.replace("Bearer ", ""));
		verificaAccountAttivo(utenteCorrente);
		verificaRuoloAmministratore(utenteCorrente);

		if (utenteCorrente.getIdUtente().equals(id)) {
			throw new UnauthorizedException("Non puoi disattivare il tuo stesso account");
		}

		Utenza utenza = utenzaDAO.findById(id)
				.orElseThrow(() -> new NotFoundException("Utente non trovato"));

		utenza.setStato(false);
		utenzaDAO.save(utenza);

		return Map.of(MESSAGE_KEY, "Utenza disattivata con successo");
	}

	@PatchMapping("/{id}/riattiva")
	public Map<String, String> riattivaUtenza(@PathVariable Integer id, @RequestHeader("Authorization") String token) {
		Utenza utenteCorrente = accessTokenUtil.verificaToken(token.replace("Bearer ", ""));
		verificaAccountAttivo(utenteCorrente);
		verificaRuoloAmministratore(utenteCorrente);

		Utenza utenza = utenzaDAO.findById(id)
				.orElseThrow(() -> new NotFoundException("Utente non trovato"));

		utenza.setStato(true);
		utenzaDAO.save(utenza);

		return Map.of(MESSAGE_KEY, "Utenza riattivata con successo");
	}

	@PatchMapping("/{id}/stato")
	public Map<String, Object> cambiaStatoUtenza(@PathVariable Integer id, @RequestBody Map<String, Boolean> data,
			@RequestHeader("Authorization") String token) {
		Utenza utenteCorrente = accessTokenUtil.verificaToken(token.replace("Bearer ", ""));
		verificaAccountAttivo(utenteCorrente);
		verificaRuoloAmministratore(utenteCorrente);

		if (utenteCorrente.getIdUtente().equals(id)) {
			throw new UnauthorizedException("Non puoi cambiare lo stato del tuo stesso account");
		}

		Utenza utenza = utenzaDAO.findById(id)
				.orElseThrow(() -> new NotFoundException("Utente non trovato"));

		Boolean nuovoStato = data.get(STATO_KEY);

		if (nuovoStato == null) {
			throw new InvalidFieldException("Stato non specificato");
		}

		utenza.setStato(nuovoStato);
		utenzaDAO.save(utenza);

		return Map.of(MESSAGE_KEY, "Stato utente aggiornato con successo", UTENZA_KEY,
				Map.of(ID_KEY, utenza.getIdUtente(), NOME_KEY, utenza.getNome(), COGNOME_KEY, utenza.getCognome(),
						EMAIL_KEY, utenza.getEmail(), RUOLO_KEY, utenza.getRuolo().toString(), STATO_KEY,
						utenza.getStato()));
	}


	private void verificaAccountAttivo(Utenza utente) {
		if (Boolean.FALSE.equals(utente.getStato())) {
			throw new UnauthorizedException("Account disattivato. Non puoi eseguire questa operazione");
		}
	}

	private void verificaRuoloAmministratore(Utenza utente) {
		if (!utente.getRuolo().equals(Ruolo.Amministratore)) {
			throw new UnauthorizedException("Solo gli amministratori possono eseguire questa operazione");
		}
	}
}