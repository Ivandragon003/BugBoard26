package it.unina.bugboard.controller;

import it.unina.bugboard.dao.IssueDAO;
import it.unina.bugboard.dao.UtenzaDAO;
import it.unina.bugboard.model.*;
import it.unina.bugboard.exception.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IssueControllerTest {

	@Mock
	private IssueDAO issueDAO;

	@Mock
	private UtenzaDAO utenzaDAO;

	@InjectMocks
	private IssueController issueController;

	private Utenza creatore;

	@BeforeEach
	void setUp() {
		creatore = new Utenza();
		creatore.setNome("Mario");
		creatore.setCognome("Rossi");
		creatore.setEmail("mario@test.com");
		creatore.setPassword("password123");
		creatore.setRuolo(Ruolo.Utente);
	}

	/**
	 * TEST 1: creaIssue - Creazione valida con tutti i parametri corretti Classe di
	 * equivalenza: Payload valido + Utente creatore esistente + Titolo univoco
	 */
	@Test
	void testCreaIssue_PayloadValidoUtenteEsistente_Success() {
		Map<String, Object> payload = new HashMap<>();
		payload.put("titolo", "Bug Login");
		payload.put("descrizione", "L'utente non riesce a effettuare il login");
		payload.put("priorita", "high");
		payload.put("stato", "todo");
		payload.put("tipo", "bug");
		payload.put("idCreatore", 1);

		when(issueDAO.findByTitolo("Bug Login")).thenReturn(Optional.empty());
		when(utenzaDAO.findById(1)).thenReturn(Optional.of(creatore));

		Issue issueSalvata = new Issue("Bug Login", "L'utente non riesce a effettuare il login", Priorita.high,
				Stato.Todo, Tipo.bug, creatore);

		when(issueDAO.save(any(Issue.class))).thenReturn(issueSalvata);

		Issue result = issueController.creaIssue(payload);

		assertNotNull(result);

		ArgumentCaptor<Issue> captor = ArgumentCaptor.forClass(Issue.class);
		verify(issueDAO).save(captor.capture());

		Issue issueSalvataCapturata = captor.getValue();
		assertEquals("Bug Login", issueSalvataCapturata.getTitolo());
		assertEquals("L'utente non riesce a effettuare il login", issueSalvataCapturata.getDescrizione());
		assertEquals(Priorita.high, issueSalvataCapturata.getPriorita());
		assertEquals(Stato.Todo, issueSalvataCapturata.getStato());
		assertEquals(Tipo.bug, issueSalvataCapturata.getTipo());
		assertEquals(creatore, issueSalvataCapturata.getCreatore());

		verify(issueDAO, times(1)).findByTitolo("Bug Login");
		verify(utenzaDAO, times(1)).findById(1);
	}

	/**
	 * TEST 2: creaIssue - Titolo vuoto (blank) Classe di equivalenza: Titolo blank
	 */
	@Test
	void testCreaIssue_TitoloVuoto_ThrowsInvalidFieldException() {
		Map<String, Object> payload = new HashMap<>();
		payload.put("titolo", "");
		payload.put("descrizione", "Descrizione valida");
		payload.put("priorita", "medium");
		payload.put("stato", "todo");
		payload.put("tipo", "bug");
		payload.put("idCreatore", 1);

		assertThrows(InvalidFieldException.class, () -> issueController.creaIssue(payload));

		verify(issueDAO, never()).findByTitolo(any());
		verify(issueDAO, never()).save(any());
	}

	/**
	 * TEST 3: creaIssue - Titolo null Classe di equivalenza: Titolo null
	 */
	@Test
	void testCreaIssue_TitoloNull_ThrowsInvalidFieldException() {
		Map<String, Object> payload = new HashMap<>();
		payload.put("titolo", null);
		payload.put("descrizione", "Descrizione valida");
		payload.put("priorita", "medium");
		payload.put("stato", "todo");
		payload.put("tipo", "bug");
		payload.put("idCreatore", 1);

		assertThrows(InvalidFieldException.class, () -> issueController.creaIssue(payload));

		verify(issueDAO, never()).save(any());
	}

	/**
	 * TEST 4: creaIssue - Titolo già esistente Classe di equivalenza: Titolo
	 * duplicato nel database
	 */
	@Test
	void testCreaIssue_TitoloDuplicato_ThrowsAlreadyExistsException() {
		Map<String, Object> payload = new HashMap<>();
		payload.put("titolo", "Bug Esistente");
		payload.put("descrizione", "Descrizione");
		payload.put("priorita", "low");
		payload.put("stato", "todo");
		payload.put("tipo", "bug");
		payload.put("idCreatore", 1);

		Issue issueEsistente = new Issue("Bug Esistente", "Descrizione vecchia", Priorita.low, Stato.Todo, Tipo.bug,
				creatore);

		when(issueDAO.findByTitolo("Bug Esistente")).thenReturn(Optional.of(issueEsistente));

		assertThrows(AlreadyExistsException.class, () -> issueController.creaIssue(payload));

		verify(issueDAO, times(1)).findByTitolo("Bug Esistente");
		verify(issueDAO, never()).save(any());
	}

	/**
	 * TEST 5: creaIssue - Priorità non valida Classe di equivalenza: Valore
	 * priorità non presente nell'enum
	 */
	@Test
	void testCreaIssue_PrioritaNonValida_ThrowsInvalidFieldException() {
		Map<String, Object> payload = new HashMap<>();
		payload.put("titolo", "Issue Test");
		payload.put("descrizione", "Descrizione");
		payload.put("priorita", "urgent"); // Non esiste nell'enum
		payload.put("stato", "todo");
		payload.put("tipo", "bug");
		payload.put("idCreatore", 1);

		when(issueDAO.findByTitolo("Issue Test")).thenReturn(Optional.empty());

		assertThrows(InvalidFieldException.class, () -> issueController.creaIssue(payload));

		verify(issueDAO, never()).save(any());
	}

	/**
	 * TEST 6: creaIssue - Stato non valido Classe di equivalenza: Valore stato non
	 * presente nell'enum
	 */
	@Test
	void testCreaIssue_StatoNonValido_ThrowsInvalidFieldException() {
		Map<String, Object> payload = new HashMap<>();
		payload.put("titolo", "Issue Test");
		payload.put("descrizione", "Descrizione");
		payload.put("priorita", "medium");
		payload.put("stato", "completed"); // Non esiste nell'enum
		payload.put("tipo", "bug");
		payload.put("idCreatore", 1);

		when(issueDAO.findByTitolo("Issue Test")).thenReturn(Optional.empty());

		assertThrows(InvalidFieldException.class, () -> issueController.creaIssue(payload));

		verify(issueDAO, never()).save(any());
	}

	/**
	 * TEST 7: creaIssue - Tipo non valido Classe di equivalenza: Valore tipo non
	 * presente nell'enum
	 */
	@Test
	void testCreaIssue_TipoNonValido_ThrowsInvalidFieldException() {
		Map<String, Object> payload = new HashMap<>();
		payload.put("titolo", "Issue Test");
		payload.put("descrizione", "Descrizione");
		payload.put("priorita", "medium");
		payload.put("stato", "todo");
		payload.put("tipo", "improvement"); // Non esiste nell'enum
		payload.put("idCreatore", 1);

		when(issueDAO.findByTitolo("Issue Test")).thenReturn(Optional.empty());

		assertThrows(InvalidFieldException.class, () -> issueController.creaIssue(payload));

		verify(issueDAO, never()).save(any());
	}

	/**
	 * TEST 8: creaIssue - Utente creatore non esistente Classe di equivalenza:
	 * idCreatore non presente nel database
	 */
	@Test
	void testCreaIssue_CreatoreNonEsistente_ThrowsNotFoundException() {
		Map<String, Object> payload = new HashMap<>();
		payload.put("titolo", "Issue Test");
		payload.put("descrizione", "Descrizione");
		payload.put("priorita", "medium");
		payload.put("stato", "todo");
		payload.put("tipo", "bug");
		payload.put("idCreatore", 999);

		when(issueDAO.findByTitolo("Issue Test")).thenReturn(Optional.empty());
		when(utenzaDAO.findById(999)).thenReturn(Optional.empty());

		assertThrows(NotFoundException.class, () -> issueController.creaIssue(payload));

		verify(utenzaDAO, times(1)).findById(999);
		verify(issueDAO, never()).save(any());
	}

	/**
	 * TEST 9: creaIssue - Parsing case-insensitive degli enum Classe di
	 * equivalenza: Valori enum con case misto vengono parsati correttamente
	 */
	@Test
	void testCreaIssue_ParsingCaseInsensitive_Success() {
		Map<String, Object> payload = new HashMap<>();
		payload.put("titolo", "Feature Request");
		payload.put("descrizione", "Nuova funzionalità");
		payload.put("priorita", "critical");
		payload.put("stato", "inprogress");
		payload.put("tipo", "features");
		payload.put("idCreatore", 1);

		when(issueDAO.findByTitolo("Feature Request")).thenReturn(Optional.empty());
		when(utenzaDAO.findById(1)).thenReturn(Optional.of(creatore));

		Issue issueSalvata = new Issue("Feature Request", "Nuova funzionalità", Priorita.critical, Stato.inProgress,
				Tipo.features, creatore);

		when(issueDAO.save(any(Issue.class))).thenReturn(issueSalvata);

		Issue result = issueController.creaIssue(payload);

		assertNotNull(result);

		ArgumentCaptor<Issue> captor = ArgumentCaptor.forClass(Issue.class);
		verify(issueDAO).save(captor.capture());

		Issue saved = captor.getValue();
		assertEquals(Priorita.critical, saved.getPriorita());
		assertEquals(Stato.inProgress, saved.getStato());
		assertEquals(Tipo.features, saved.getTipo());
	}

	/**
	 * TEST 10: creaIssue - Priorità "none" (valore default) Classe di equivalenza:
	 * Priorità null/blank viene convertita in "none"
	 */
	@Test
	void testCreaIssue_PrioritaNoneDefault_Success() {
		Map<String, Object> payload = new HashMap<>();
		payload.put("titolo", "Issue Semplice");
		payload.put("descrizione", "Descrizione");
		payload.put("priorita", "none");
		payload.put("stato", "todo");
		payload.put("tipo", "question");
		payload.put("idCreatore", 1);

		when(issueDAO.findByTitolo("Issue Semplice")).thenReturn(Optional.empty());
		when(utenzaDAO.findById(1)).thenReturn(Optional.of(creatore));

		Issue issueSalvata = new Issue("Issue Semplice", "Descrizione", Priorita.none, Stato.Todo, Tipo.question,
				creatore);

		when(issueDAO.save(any(Issue.class))).thenReturn(issueSalvata);

		Issue result = issueController.creaIssue(payload);

		assertNotNull(result);

		ArgumentCaptor<Issue> captor = ArgumentCaptor.forClass(Issue.class);
		verify(issueDAO).save(captor.capture());

		assertEquals(Priorita.none, captor.getValue().getPriorita());
		assertEquals(Tipo.question, captor.getValue().getTipo());
	}

	/**
	 * TEST 11: creaIssue - Payload completamente null Classe di equivalenza: Input
	 * null (validazione esplicita)
	 */
	@Test
	void testCreaIssue_PayloadNull_ThrowsInvalidFieldException() {
		Map<String, Object> payloadNull = null;

		assertThrows(InvalidFieldException.class, () -> issueController.creaIssue(payloadNull));

		verify(issueDAO, never()).save(any());
	}

	/**
	 * TEST 12: creaIssue - idCreatore null Classe di equivalenza: Campo
	 * obbligatorio mancante
	 */
	@Test
	void testCreaIssue_IdCreatoreNull_ThrowsInvalidFieldException() {
		Map<String, Object> payload = new HashMap<>();
		payload.put("titolo", "Issue Test");
		payload.put("descrizione", "Descrizione");
		payload.put("priorita", "medium");
		payload.put("stato", "todo");
		payload.put("tipo", "bug");
		payload.put("idCreatore", null);

		assertThrows(InvalidFieldException.class, () -> issueController.creaIssue(payload));

		verify(issueDAO, never()).save(any());
	}

	/**
	 * TEST 13: creaIssue - Verifica parsing "in_progress" con underscore Classe di
	 * equivalenza: Stato con formato alternativo (underscore)
	 */
	@Test
	void testCreaIssue_StatoConUnderscore_Success() {
		Map<String, Object> payload = new HashMap<>();
		payload.put("titolo", "Issue In Progress");
		payload.put("descrizione", "Test underscore");
		payload.put("priorita", "low");
		payload.put("stato", "in_progress"); // Con underscore
		payload.put("tipo", "bug");
		payload.put("idCreatore", 1);

		when(issueDAO.findByTitolo("Issue In Progress")).thenReturn(Optional.empty());
		when(utenzaDAO.findById(1)).thenReturn(Optional.of(creatore));

		Issue issueSalvata = new Issue("Issue In Progress", "Test underscore", Priorita.low, Stato.inProgress, Tipo.bug,
				creatore);

		when(issueDAO.save(any(Issue.class))).thenReturn(issueSalvata);

		Issue result = issueController.creaIssue(payload);

		assertNotNull(result);

		ArgumentCaptor<Issue> captor = ArgumentCaptor.forClass(Issue.class);
		verify(issueDAO).save(captor.capture());

		assertEquals(Stato.inProgress, captor.getValue().getStato());
	}

	/**
	 * TEST 14 NUOVO: creaIssue - Stato vuoto (empty string, non blank) Valore di
	 * frontiera
	 */
	@Test
	void testCreaIssue_StatoEmptyString_ThrowsInvalidFieldException() {
		Map<String, Object> payload = new HashMap<>();
		payload.put("titolo", "Test");
		payload.put("descrizione", "Desc");
		payload.put("priorita", "medium");
		payload.put("stato", "");
		payload.put("tipo", "bug");
		payload.put("idCreatore", 1);

		when(issueDAO.findByTitolo(any())).thenReturn(Optional.empty());

		assertThrows(InvalidFieldException.class, () -> issueController.creaIssue(payload));
	}

	@Test
	void testCreaIssue_PrioritaBlank_ConvertsToNone() {
		Map<String, Object> payload = new HashMap<>();
		payload.put("titolo", "Test Priorita Blank");
		payload.put("descrizione", "Desc");
		payload.put("priorita", "   ");
		payload.put("stato", "todo");
		payload.put("tipo", "bug");
		payload.put("idCreatore", 1);

		when(issueDAO.findByTitolo("Test Priorita Blank")).thenReturn(Optional.empty());
		when(utenzaDAO.findById(1)).thenReturn(Optional.of(creatore));

		Issue issueSalvata = new Issue("Test Priorita Blank", "Desc", Priorita.none, Stato.Todo, Tipo.bug, creatore);
		when(issueDAO.save(any())).thenReturn(issueSalvata);

		Issue result = issueController.creaIssue(payload);

		assertNotNull(result);
		assertEquals(Priorita.none, result.getPriorita());

		ArgumentCaptor<Issue> captor = ArgumentCaptor.forClass(Issue.class);
		verify(issueDAO).save(captor.capture());
		assertEquals(Priorita.none, captor.getValue().getPriorita());
	}

	/**
	 * TEST 17 NUOVO: creaIssue - Tipo blank dovrebbe fallire Verifica validazione
	 * obbligatoria
	 */
	@Test
	void testCreaIssue_TipoBlank_ThrowsInvalidFieldException() {
		Map<String, Object> payload = new HashMap<>();
		payload.put("titolo", "Test");
		payload.put("descrizione", "Desc");
		payload.put("priorita", "medium");
		payload.put("stato", "todo");
		payload.put("tipo", "   ");
		payload.put("idCreatore", 1);

		when(issueDAO.findByTitolo(any())).thenReturn(Optional.empty());

		assertThrows(InvalidFieldException.class, () -> issueController.creaIssue(payload));
	}

	/**
	 * TEST 18: creaIssue - Priorita null diventa "none"
	 */
	@Test
	void testCreaIssue_PrioritaNull_ConvertsToNone() {
		Map<String, Object> payload = new HashMap<>();
		payload.put("titolo", "Test Priorita Null");
		payload.put("descrizione", "Descrizione valida");
		payload.put("priorita", null);
		payload.put("stato", "todo");
		payload.put("tipo", "bug");
		payload.put("idCreatore", 1);

		when(issueDAO.findByTitolo("Test Priorita Null")).thenReturn(Optional.empty());
		when(utenzaDAO.findById(1)).thenReturn(Optional.of(creatore));

		Issue issueSalvata = new Issue("Test Priorita Null", "Descrizione valida", Priorita.none, Stato.Todo, Tipo.bug,
				creatore);
		when(issueDAO.save(any())).thenReturn(issueSalvata);

		Issue result = issueController.creaIssue(payload);

		assertNotNull(result);
		assertEquals(Priorita.none, result.getPriorita());

		ArgumentCaptor<Issue> captor = ArgumentCaptor.forClass(Issue.class);
		verify(issueDAO).save(captor.capture());
		assertEquals(Priorita.none, captor.getValue().getPriorita());
	}

	/**
	 * TEST 20: creaIssue - Titolo blank (solo spazi) viene rifiutato Il controller
	 * valida che titolo non sia blank
	 */
	@Test
	void testCreaIssue_TitoloBlank_ThrowsInvalidFieldException() {
		Map<String, Object> payload = new HashMap<>();
		payload.put("titolo", "   "); // ❌ BLANK (solo spazi)
		payload.put("descrizione", "Descrizione valida");
		payload.put("priorita", "medium");
		payload.put("stato", "todo");
		payload.put("tipo", "bug");
		payload.put("idCreatore", 1);

		assertThrows(InvalidFieldException.class, () -> issueController.creaIssue(payload));

		verify(issueDAO, never()).findByTitolo(any());
		verify(issueDAO, never()).save(any());
	}

	@Test
	void testCreaIssue_DescrizioneNull_ThrowsInvalidFieldException() {
	    Map<String, Object> payload = new HashMap<>();
	    payload.put("titolo", "Issue senza descrizione");
	    payload.put("descrizione", null);
	    payload.put("priorita", "medium");
	    payload.put("stato", "todo");
	    payload.put("tipo", "bug");
	    payload.put("idCreatore", 1);

	    // AGGIUNGI QUESTI MOCK
	    when(issueDAO.findByTitolo("Issue senza descrizione")).thenReturn(Optional.empty());
	    when(utenzaDAO.findById(1)).thenReturn(Optional.of(creatore));

	    assertThrows(InvalidFieldException.class, 
	        () -> issueController.creaIssue(payload));
	        
	    verify(issueDAO, times(1)).findByTitolo("Issue senza descrizione");
	    verify(utenzaDAO, times(1)).findById(1);
	}

}