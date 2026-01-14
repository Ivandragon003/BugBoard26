package it.unina.bugboard.controller;

import it.unina.bugboard.dao.UtenzaDAO;
import it.unina.bugboard.model.Ruolo;
import it.unina.bugboard.model.Utenza;
import it.unina.bugboard.exception.*;
import it.unina.bugboard.util.AccessTokenUtil;
import it.unina.bugboard.util.PasswordUtil;
import it.unina.bugboard.util.ValidationUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UtenzaControllerTest {

	@Mock
	private UtenzaDAO utenzaDAO;

	@Mock
	private AccessTokenUtil accessTokenUtil;

	@Mock
	private PasswordUtil passwordUtil;

	@Mock
	private ValidationUtil validationUtil;

	@InjectMocks
	private UtenzaController utenzaController;

	private Utenza amministratore;
	private String tokenValido;
	private Map<String, String> utenzaDataValida;

	@BeforeEach
	void setUp() throws Exception {

		amministratore = new Utenza();
		java.lang.reflect.Field idField = Utenza.class.getDeclaredField("idUtente");
		idField.setAccessible(true);
		idField.set(amministratore, 1);

		amministratore.setNome("Admin");
		amministratore.setCognome("Test");
		amministratore.setEmail("admin@test.com");
		amministratore.setPassword("hashedPassword123");
		amministratore.setRuolo(Ruolo.Amministratore);
		amministratore.setStato(true);

		tokenValido = "Bearer validToken123";

		utenzaDataValida = Map.of("nome", "Mario", "cognome", "Rossi", "email", "mario.rossi@test.com", "password",
				"password123", "ruolo", "Utente");
	}

	/*
	 TEST 1: creaUtenza - Dati validi con ruolo Utente
	 CE: Dati completi e corretti, token admin valido
	 Atteso: Utenza creata con successo
	 */
	@Test
	void testCreaUtenza_DatiValidi_Success() throws Exception {
		when(accessTokenUtil.verificaToken("validToken123")).thenReturn(amministratore);
		when(utenzaDAO.existsByEmail("mario.rossi@test.com")).thenReturn(false);
		when(passwordUtil.hashPassword("password123")).thenReturn("hashedPassword123");

		Utenza nuovaUtenzaSalvata = new Utenza("Mario", "Rossi", "mario.rossi@test.com", "hashedPassword123",
				Ruolo.Utente, amministratore);
		java.lang.reflect.Field idField = Utenza.class.getDeclaredField("idUtente");
		idField.setAccessible(true);
		idField.set(nuovaUtenzaSalvata, 2);

		when(utenzaDAO.save(any(Utenza.class))).thenReturn(nuovaUtenzaSalvata);

		Map<String, Object> result = utenzaController.creaUtenza(utenzaDataValida, tokenValido);

		assertNotNull(result);
		assertEquals("Utenza creata con successo", result.get("message"));

		@SuppressWarnings("unchecked")
		Map<String, Object> utenzaMap = (Map<String, Object>) result.get("utenza");
		assertEquals(2, utenzaMap.get("id"));
		assertEquals("Mario", utenzaMap.get("nome"));
		assertEquals("Rossi", utenzaMap.get("cognome"));
		assertEquals("mario.rossi@test.com", utenzaMap.get("email"));
		assertEquals("Utente", utenzaMap.get("ruolo"));
		assertEquals(true, utenzaMap.get("stato"));

		verify(accessTokenUtil).verificaToken("validToken123");
		verify(validationUtil).validaNomeCognome("Mario", "nome");
		verify(validationUtil).validaNomeCognome("Rossi", "cognome");
		verify(validationUtil).validaPassword("password123");
		verify(validationUtil).validaUniqueEmail("mario.rossi@test.com");
		verify(utenzaDAO).existsByEmail("mario.rossi@test.com");
		verify(passwordUtil).hashPassword("password123");

		ArgumentCaptor<Utenza> captor = ArgumentCaptor.forClass(Utenza.class);
		verify(utenzaDAO).save(captor.capture());

		Utenza utenzaSalvata = captor.getValue();
		assertEquals("Mario", utenzaSalvata.getNome());
		assertEquals("Rossi", utenzaSalvata.getCognome());
		assertEquals("mario.rossi@test.com", utenzaSalvata.getEmail());
		assertEquals("hashedPassword123", utenzaSalvata.getPassword());
		assertEquals(Ruolo.Utente, utenzaSalvata.getRuolo());
	}

	/*
	 TEST 2: creaUtenza - Creazione amministratore
	 CE: Ruolo Amministratore
	 Atteso: Nuovo admin creato correttamente
	 */
	
	@Test
	void testCreaUtenza_CreazioneAmministratore_Success() throws Exception {
		Map<String, String> utenzaDataAdmin = Map.of("nome", "Luigi", "cognome", "Verdi", "email",
				"luigi.verdi@test.com", "password", "adminPass123", "ruolo", "amministratore");

		when(accessTokenUtil.verificaToken("validToken123")).thenReturn(amministratore);
		when(utenzaDAO.existsByEmail("luigi.verdi@test.com")).thenReturn(false);
		when(passwordUtil.hashPassword("adminPass123")).thenReturn("hashedAdminPass");

		Utenza nuovoAdmin = new Utenza("Luigi", "Verdi", "luigi.verdi@test.com", "hashedAdminPass",
				Ruolo.Amministratore, amministratore);
		java.lang.reflect.Field idField = Utenza.class.getDeclaredField("idUtente");
		idField.setAccessible(true);
		idField.set(nuovoAdmin, 3);

		when(utenzaDAO.save(any(Utenza.class))).thenReturn(nuovoAdmin);

		Map<String, Object> result = utenzaController.creaUtenza(utenzaDataAdmin, tokenValido);

		@SuppressWarnings("unchecked")
		Map<String, Object> utenzaMap = (Map<String, Object>) result.get("utenza");
		assertEquals("Amministratore", utenzaMap.get("ruolo"));

		ArgumentCaptor<Utenza> captor = ArgumentCaptor.forClass(Utenza.class);
		verify(utenzaDAO).save(captor.capture());
		assertEquals(Ruolo.Amministratore, captor.getValue().getRuolo());
	}

	/*
	 TEST 3: creaUtenza - Token invalido
	 CE: Token non valido o scaduto
	 Atteso: UnauthorizedException
	 */
	
	@Test
	void testCreaUtenza_TokenNonValido_ThrowsUnauthorizedException() {
		when(accessTokenUtil.verificaToken("invalidToken")).thenThrow(new UnauthorizedException("Token non valido"));

		assertThrows(UnauthorizedException.class,
				() -> utenzaController.creaUtenza(utenzaDataValida, "Bearer invalidToken"));

		verify(utenzaDAO, never()).save(any());
	}

	/*
	 TEST 4: creaUtenza - Account creatore disattivato
	 CE: Creatore con stato = false
	 Atteso: UnauthorizedException
	 */
	@Test
	void testCreaUtenza_AccountCreatereDisattivato_ThrowsUnauthorizedException() {
		amministratore.setStato(false);
		when(accessTokenUtil.verificaToken("validToken123")).thenReturn(amministratore);

		UnauthorizedException exception = assertThrows(UnauthorizedException.class,
				() -> utenzaController.creaUtenza(utenzaDataValida, tokenValido));

		assertTrue(exception.getMessage().contains("Account disattivato"));
		verify(utenzaDAO, never()).save(any());
	}

	/*
	 TEST 5: creaUtenza - Utente non amministratore
	 CE: Creatore con ruolo != Amministratore
	 Atteso: UnauthorizedException
	 */
	@Test
	void testCreaUtenza_UtenteNonAmministratore_ThrowsUnauthorizedException() {
		amministratore.setRuolo(Ruolo.Utente);
		when(accessTokenUtil.verificaToken("validToken123")).thenReturn(amministratore);

		UnauthorizedException exception = assertThrows(UnauthorizedException.class,
				() -> utenzaController.creaUtenza(utenzaDataValida, tokenValido));

		assertTrue(exception.getMessage().contains("Solo gli amministratori"));
		verify(utenzaDAO, never()).save(any());
	}

	/*
	 TEST 6: creaUtenza - Nome non valido
	 CE: Nome vuoto o null
	 Atteso: InvalidFieldException
	 */
	@Test
	void testCreaUtenza_NomeNonValido_ThrowsInvalidFieldException() {
		when(accessTokenUtil.verificaToken("validToken123")).thenReturn(amministratore);
		doThrow(new InvalidFieldException("Campo nome non valido")).when(validationUtil).validaNomeCognome(anyString(),
				eq("nome"));

		assertThrows(InvalidFieldException.class, () -> utenzaController.creaUtenza(utenzaDataValida, tokenValido));

		verify(utenzaDAO, never()).save(any());
	}

	/*
	 TEST 7: creaUtenza - Cognome non valido
	 CE: Cognome vuoto o null
	 Atteso: InvalidFieldException
	 */
	@Test
	void testCreaUtenza_CognomeNonValido_ThrowsInvalidFieldException() {
		when(accessTokenUtil.verificaToken("validToken123")).thenReturn(amministratore);

	
		doNothing().when(validationUtil).validaNomeCognome("Mario", "nome");

		
		doThrow(new InvalidFieldException("Campo cognome non valido")).when(validationUtil).validaNomeCognome("Rossi",
				"cognome");

		assertThrows(InvalidFieldException.class, () -> utenzaController.creaUtenza(utenzaDataValida, tokenValido));

		verify(utenzaDAO, never()).save(any());
	}

	/*
	 TEST 8: creaUtenza - Password troppo corta
	 CE: Password < 6 caratteri
	 Atteso: InvalidFieldException
	 */

	@Test
	void testCreaUtenza_PasswordNonValida_ThrowsInvalidFieldException() {
		when(accessTokenUtil.verificaToken("validToken123")).thenReturn(amministratore);
		doThrow(new InvalidFieldException("Password non valida")).when(validationUtil).validaPassword(anyString());

		assertThrows(InvalidFieldException.class, () -> utenzaController.creaUtenza(utenzaDataValida, tokenValido));

		verify(utenzaDAO, never()).save(any());
	}


/*
 TEST 9: creaUtenza - Formato email non valido
 CE: Email malformata
 Atteso: InvalidFieldException
 */
	@Test
	void testCreaUtenza_EmailNonValida_ThrowsInvalidFieldException() {
		when(accessTokenUtil.verificaToken("validToken123")).thenReturn(amministratore);
		doThrow(new InvalidFieldException("Email non valida")).when(validationUtil).validaUniqueEmail(anyString());

		assertThrows(InvalidFieldException.class, () -> utenzaController.creaUtenza(utenzaDataValida, tokenValido));

		verify(utenzaDAO, never()).save(any());
	}

	/*
	 TEST 10: creaUtenza - Email già presente
	 CE: Email duplicata nel DB
	 Atteso: AlreadyExistsException
	 */
	@Test
	void testCreaUtenza_EmailGiaEsistente_ThrowsAlreadyExistsException() {
		when(accessTokenUtil.verificaToken("validToken123")).thenReturn(amministratore);
		when(utenzaDAO.existsByEmail("mario.rossi@test.com")).thenReturn(true);

		AlreadyExistsException exception = assertThrows(AlreadyExistsException.class,
				() -> utenzaController.creaUtenza(utenzaDataValida, tokenValido));

		assertTrue(
				exception.getMessage().contains("Email già registrata") || exception.getMessage().contains("Email gi"));
		verify(utenzaDAO, never()).save(any());
	}

	/*
	 TEST 11: creaUtenza - Ruolo con case misto
	 CE: Ruolo scritto in maiuscole/minuscole miste
	 Atteso: Creazione ok, ruolo riconosciuto
	 */
	@Test
	void testCreaUtenza_RuoloMixedCase_Success() throws Exception {
		Map<String, String> utenzaDataMixed = Map.of("nome", "Paolo", "cognome", "Bianchi", "email",
				"paolo.bianchi@test.com", "password", "password123", "ruolo", "uTeNtE");

		when(accessTokenUtil.verificaToken("validToken123")).thenReturn(amministratore);
		when(utenzaDAO.existsByEmail("paolo.bianchi@test.com")).thenReturn(false);
		when(passwordUtil.hashPassword("password123")).thenReturn("hashedPassword");

		Utenza nuovaUtenza = new Utenza("Paolo", "Bianchi", "paolo.bianchi@test.com", "hashedPassword", Ruolo.Utente,
				amministratore);
		java.lang.reflect.Field idField = Utenza.class.getDeclaredField("idUtente");
		idField.setAccessible(true);
		idField.set(nuovaUtenza, 4);

		when(utenzaDAO.save(any(Utenza.class))).thenReturn(nuovaUtenza);

		Map<String, Object> result = utenzaController.creaUtenza(utenzaDataMixed, tokenValido);

		assertNotNull(result);

		ArgumentCaptor<Utenza> captor = ArgumentCaptor.forClass(Utenza.class);
		verify(utenzaDAO).save(captor.capture());
		assertEquals(Ruolo.Utente, captor.getValue().getRuolo());
	}

	/*
	 TEST 12: creaUtenza - Ruolo inesistente
	 CE: Ruolo non presente nell'enum
	 Atteso: IllegalArgumentException
	 */

	@Test
	void testCreaUtenza_RuoloNonValido_ThrowsIllegalArgumentException() {
		Map<String, String> utenzaDataInvalida = Map.of("nome", "Test", "cognome", "User", "email", "test@test.com",
				"password", "password123", "ruolo", "SuperAdmin");

		when(accessTokenUtil.verificaToken("validToken123")).thenReturn(amministratore);
		when(utenzaDAO.existsByEmail("test@test.com")).thenReturn(false);

		assertThrows(IllegalArgumentException.class,
				() -> utenzaController.creaUtenza(utenzaDataInvalida, tokenValido));

		verify(utenzaDAO, never()).save(any());
	}

	/*
	 TEST 13: creaUtenza - Verifica hashing password
	 CE: Controllo che la password venga hashata
	 Atteso: Password salvata in formato hash
	 */
	@Test
	void testCreaUtenza_VerificaHashPassword_Success() throws Exception {
		when(accessTokenUtil.verificaToken("validToken123")).thenReturn(amministratore);
		when(utenzaDAO.existsByEmail("mario.rossi@test.com")).thenReturn(false);
		when(passwordUtil.hashPassword("password123")).thenReturn("$2a$10$hashedPasswordExample");

		Utenza nuovaUtenza = new Utenza("Mario", "Rossi", "mario.rossi@test.com", "$2a$10$hashedPasswordExample",
				Ruolo.Utente, amministratore);
		java.lang.reflect.Field idField = Utenza.class.getDeclaredField("idUtente");
		idField.setAccessible(true);
		idField.set(nuovaUtenza, 5);

		when(utenzaDAO.save(any(Utenza.class))).thenReturn(nuovaUtenza);

		utenzaController.creaUtenza(utenzaDataValida, tokenValido);

		verify(passwordUtil).hashPassword("password123");

		ArgumentCaptor<Utenza> captor = ArgumentCaptor.forClass(Utenza.class);
		verify(utenzaDAO).save(captor.capture());
		assertEquals("$2a$10$hashedPasswordExample", captor.getValue().getPassword());
	}

	/*
	 TEST 14: creaUtenza - Verifica associazione creatore
	 CE: Controllo link con l'admin creatore
	 Atteso: Creatore associato correttamente
	 */
	@Test
	void testCreaUtenza_VerificaAssociazioneCreatore_Success() throws Exception {
		when(accessTokenUtil.verificaToken("validToken123")).thenReturn(amministratore);
		when(utenzaDAO.existsByEmail("mario.rossi@test.com")).thenReturn(false);
		when(passwordUtil.hashPassword("password123")).thenReturn("hashedPassword");

		Utenza nuovaUtenza = new Utenza("Mario", "Rossi", "mario.rossi@test.com", "hashedPassword", Ruolo.Utente,
				amministratore);
		java.lang.reflect.Field idField = Utenza.class.getDeclaredField("idUtente");
		idField.setAccessible(true);
		idField.set(nuovaUtenza, 6);

		when(utenzaDAO.save(any(Utenza.class))).thenReturn(nuovaUtenza);

		utenzaController.creaUtenza(utenzaDataValida, tokenValido);

		ArgumentCaptor<Utenza> captor = ArgumentCaptor.forClass(Utenza.class);
		verify(utenzaDAO).save(captor.capture());

		Utenza utenzaSalvata = captor.getValue();
		assertNotNull(utenzaSalvata.getCreatore());
		assertEquals(amministratore.getIdUtente(), utenzaSalvata.getCreatore().getIdUtente());
	}

	/*
	 TEST 15: creaUtenza - Verifica stato iniziale
	 CE: Controllo stato di default
	 Atteso: Stato = true
	 */
	@Test
	void testCreaUtenza_VerificaStatoIniziale_Success() throws Exception {
		when(accessTokenUtil.verificaToken("validToken123")).thenReturn(amministratore);
		when(utenzaDAO.existsByEmail("mario.rossi@test.com")).thenReturn(false);
		when(passwordUtil.hashPassword("password123")).thenReturn("hashedPassword");

		Utenza nuovaUtenza = new Utenza("Mario", "Rossi", "mario.rossi@test.com", "hashedPassword", Ruolo.Utente,
				amministratore);
		java.lang.reflect.Field idField = Utenza.class.getDeclaredField("idUtente");
		idField.setAccessible(true);
		idField.set(nuovaUtenza, 7);

		when(utenzaDAO.save(any(Utenza.class))).thenReturn(nuovaUtenza);

		Map<String, Object> result = utenzaController.creaUtenza(utenzaDataValida, tokenValido);

		@SuppressWarnings("unchecked")
		Map<String, Object> utenzaMap = (Map<String, Object>) result.get("utenza");
		assertEquals(true, utenzaMap.get("stato"));
	}
}