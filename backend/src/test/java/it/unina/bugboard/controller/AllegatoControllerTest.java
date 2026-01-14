package it.unina.bugboard.controller;

import it.unina.bugboard.dao.AllegatoDAO;
import it.unina.bugboard.dao.IssueDAO;
import it.unina.bugboard.model.*;
import it.unina.bugboard.exception.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AllegatoControllerTest {

	@Mock
	private AllegatoDAO allegatoDAO;

	@Mock
	private IssueDAO issueDAO;

	@InjectMocks
	private AllegatoController allegatoController;

	private Issue issueValida;
	private Utenza creatore;

	@BeforeEach
	void setUp() throws Exception {
		creatore = new Utenza();
		creatore.setNome("Mario");
		creatore.setCognome("Rossi");
		creatore.setEmail("mario@test.com");
		creatore.setPassword("password123");
		creatore.setRuolo(Ruolo.Utente);

		issueValida = new Issue();
		java.lang.reflect.Field idField = Issue.class.getDeclaredField("idIssue");
		idField.setAccessible(true);
		idField.set(issueValida, 1);

		issueValida.setTitolo("Issue Test");
		issueValida.setDescrizione("Descrizione test");
		issueValida.setPriorita(Priorita.medium);
		issueValida.setStato(Stato.Todo);
		issueValida.setTipo(Tipo.bug);
		issueValida.setCreatore(creatore);
	}

	/*
	 TEST 1: uploadAllegato - File immagine valido
	 CE: File JPEG < 10MB, Issue esistente
	 Atteso: Upload ok, allegato salvato
	 */

	@Test
	void testUploadAllegato_FileValidoIssueEsistente_Success() throws Exception {
		byte[] contenutoFile = "test file content".getBytes();
		MockMultipartFile file = new MockMultipartFile("file", "test-image.jpg", "image/jpeg", contenutoFile);
		Integer idIssue = 1;

		when(issueDAO.findById(idIssue)).thenReturn(Optional.of(issueValida));

		Allegato allegatoSalvato = new Allegato(file.getOriginalFilename(), file.getContentType(), (int) file.getSize(),
				contenutoFile, issueValida);
		java.lang.reflect.Field idAllegatoField = Allegato.class.getDeclaredField("idAllegato");
		idAllegatoField.setAccessible(true);
		idAllegatoField.set(allegatoSalvato, 100);

		when(allegatoDAO.save(any(Allegato.class))).thenReturn(allegatoSalvato);

		Map<String, Object> result = allegatoController.uploadAllegato(file, idIssue);

		assertNotNull(result);
		assertEquals(100, result.get("idAllegato"));
		assertEquals("test-image.jpg", result.get("nomeFile"));
		assertEquals("image/jpeg", result.get("tipoFile"));
		assertTrue(result.get("message").toString().contains("successo"));

		ArgumentCaptor<Allegato> captor = ArgumentCaptor.forClass(Allegato.class);
		verify(allegatoDAO).save(captor.capture());

		Allegato allegatoSalvatoCapturato = captor.getValue();
		assertEquals("test-image.jpg", allegatoSalvatoCapturato.getNomeFile());
		assertEquals("image/jpeg", allegatoSalvatoCapturato.getTipoFile());
		assertEquals(contenutoFile.length, allegatoSalvatoCapturato.getDimensione());
		assertArrayEquals(contenutoFile, allegatoSalvatoCapturato.getFileData());
		assertEquals(issueValida, allegatoSalvatoCapturato.getIssue());

		verify(issueDAO, times(1)).findById(idIssue);
	}

	/*
	 TEST 2: uploadAllegato - File null
	 CE: File mancante
	 Atteso: InvalidFieldException
	 */
	@Test
	void testUploadAllegato_FileNull_ThrowsInvalidFieldException() {
		MultipartFile fileNull = null;
		Integer idIssue = 1;

		assertThrows(InvalidFieldException.class, () -> allegatoController.uploadAllegato(fileNull, idIssue));

		verify(issueDAO, never()).findById(any());
		verify(allegatoDAO, never()).save(any());
	}


/*
 TEST 3: uploadAllegato - File vuoto
 CE: Dimensione = 0 byte
 Atteso: InvalidFieldException
 */
	@Test
	void testUploadAllegato_FileVuoto_ThrowsInvalidFieldException() {
		MockMultipartFile fileVuoto = new MockMultipartFile("file", "empty.jpg", "image/jpeg", new byte[0]);
		Integer idIssue = 1;

		assertThrows(InvalidFieldException.class, () -> allegatoController.uploadAllegato(fileVuoto, idIssue));

		verify(issueDAO, never()).findById(any());
		verify(allegatoDAO, never()).save(any());
	}

	/*
	 TEST 4: uploadAllegato - File troppo grande
	 CE: Dimensione > 10MB
	 Atteso: InvalidFieldException (dimensione massima superata)
	 */
	@Test
	void testUploadAllegato_FileTroppoGrande_ThrowsInvalidFieldException() {
		byte[] contenutoGrande = new byte[11 * 1024 * 1024];
		MockMultipartFile fileTroppoGrande = new MockMultipartFile("file", "large-file.jpg", "image/jpeg",
				contenutoGrande);
		Integer idIssue = 1;

		InvalidFieldException exception = assertThrows(InvalidFieldException.class,
				() -> allegatoController.uploadAllegato(fileTroppoGrande, idIssue));

		assertTrue(exception.getMessage().contains("dimensione massima"));
		verify(issueDAO, never()).findById(any());
		verify(allegatoDAO, never()).save(any());
	}

	/*
	 TEST 5: uploadAllegato - Tipo MIME non supportato
	 CE: ContentType non ammesso
	 Atteso: InvalidFieldException (tipo non supportato)
	 */
	@Test
	void testUploadAllegato_TipoMimeNonSupportato_ThrowsInvalidFieldException() {
		MockMultipartFile fileNonSupportato = new MockMultipartFile("file", "test.exe", "application/x-msdownload",
				"fake exe content".getBytes());
		Integer idIssue = 1;

		InvalidFieldException exception = assertThrows(InvalidFieldException.class,
				() -> allegatoController.uploadAllegato(fileNonSupportato, idIssue));

		assertTrue(exception.getMessage().contains("non supportato"));
		verify(issueDAO, never()).findById(any());
		verify(allegatoDAO, never()).save(any());
	}

	/*
	 TEST 6: uploadAllegato - Issue inesistente
	 CE: idIssue non trovato nel DB
	 Atteso: NotFoundException
	 */

	@Test
	void testUploadAllegato_IssueNonEsistente_ThrowsNotFoundException() {
		MockMultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", "test content".getBytes());
		Integer idIssueNonEsistente = 999;

		when(issueDAO.findById(idIssueNonEsistente)).thenReturn(Optional.empty());

		NotFoundException exception = assertThrows(NotFoundException.class,
				() -> allegatoController.uploadAllegato(file, idIssueNonEsistente));

		assertTrue(exception.getMessage().contains("Issue non trovata"));
		assertTrue(exception.getMessage().contains("999"));
		verify(issueDAO, times(1)).findById(idIssueNonEsistente);
		verify(allegatoDAO, never()).save(any());
	}

	/*
	 TEST 7: uploadAllegato - PDF valido
	 CE: File PDF supportato
	 Atteso: Upload ok
	 */

	@Test
	void testUploadAllegato_PdfValido_Success() throws Exception {
		byte[] contenutoPdf = "fake pdf content".getBytes();
		MockMultipartFile filePdf = new MockMultipartFile("file", "documento.pdf", "application/pdf", contenutoPdf);
		Integer idIssue = 1;

		when(issueDAO.findById(idIssue)).thenReturn(Optional.of(issueValida));

		Allegato allegatoSalvato = new Allegato(filePdf.getOriginalFilename(), filePdf.getContentType(),
				(int) filePdf.getSize(), contenutoPdf, issueValida);
		java.lang.reflect.Field idAllegatoField = Allegato.class.getDeclaredField("idAllegato");
		idAllegatoField.setAccessible(true);
		idAllegatoField.set(allegatoSalvato, 200);

		when(allegatoDAO.save(any(Allegato.class))).thenReturn(allegatoSalvato);

		Map<String, Object> result = allegatoController.uploadAllegato(filePdf, idIssue);

		assertNotNull(result);
		assertEquals(200, result.get("idAllegato"));
		assertEquals("documento.pdf", result.get("nomeFile"));
		assertEquals("application/pdf", result.get("tipoFile"));

		ArgumentCaptor<Allegato> captor = ArgumentCaptor.forClass(Allegato.class);
		verify(allegatoDAO).save(captor.capture());
		assertEquals("application/pdf", captor.getValue().getTipoFile());

		verify(issueDAO, times(1)).findById(idIssue);
	}

	/*
	 TEST 8: uploadAllegato - File da 10MB esatti
	 CE: Dimensione massima consentita (frontiera)
	 Atteso: Upload ok
	 */
	@Test
	void testUploadAllegato_FileAlLimite10MB_Success() throws Exception {
		byte[] contenuto10MB = new byte[10 * 1024 * 1024];
		MockMultipartFile fileAlLimite = new MockMultipartFile("file", "large-valid.jpg", "image/jpeg", contenuto10MB);
		Integer idIssue = 1;

		when(issueDAO.findById(idIssue)).thenReturn(Optional.of(issueValida));

		Allegato allegatoSalvato = new Allegato(fileAlLimite.getOriginalFilename(), fileAlLimite.getContentType(),
				(int) fileAlLimite.getSize(), contenuto10MB, issueValida);
		java.lang.reflect.Field idAllegatoField = Allegato.class.getDeclaredField("idAllegato");
		idAllegatoField.setAccessible(true);
		idAllegatoField.set(allegatoSalvato, 300);

		when(allegatoDAO.save(any(Allegato.class))).thenReturn(allegatoSalvato);

		Map<String, Object> result = allegatoController.uploadAllegato(fileAlLimite, idIssue);

		assertNotNull(result);
		assertEquals(300, result.get("idAllegato"));
		assertEquals(10 * 1024 * 1024, result.get("dimensione"));

		ArgumentCaptor<Allegato> captor = ArgumentCaptor.forClass(Allegato.class);
		verify(allegatoDAO).save(captor.capture());
		assertEquals(10 * 1024 * 1024, captor.getValue().getDimensione());

		verify(issueDAO, times(1)).findById(idIssue);
	}

	/*
	 TEST 9: uploadAllegato - idIssue null
	 CE: ID nullo
	 Atteso: IllegalArgumentException dal DAO
	 */
	@Test
	void testUploadAllegato_IdIssueNull_ThrowsIllegalArgumentException() {
		MockMultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", "test content".getBytes());

		when(issueDAO.findById(null)).thenThrow(new IllegalArgumentException("L'ID fornito non deve essere nullo"));

		IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
				() -> allegatoController.uploadAllegato(file, null));

		assertTrue(exception.getMessage().contains("nullo") || exception.getMessage().contains("null"));

		verify(issueDAO).findById(null);

		verify(allegatoDAO, never()).save(any());
	}

	/*
	 TEST 10: uploadAllegato - File DOCX valido
	 CE: Documento Word supportato
	 Atteso: Upload ok
	 */
	@Test
	void testUploadAllegato_DocxValido_Success() throws Exception {
		byte[] contenutoDocx = "fake docx content".getBytes();
		MockMultipartFile fileDocx = new MockMultipartFile("file", "documento.docx",
				"application/vnd.openxmlformats-officedocument.wordprocessingml.document", contenutoDocx);
		Integer idIssue = 1;

		when(issueDAO.findById(idIssue)).thenReturn(Optional.of(issueValida));

		Allegato allegatoSalvato = new Allegato(fileDocx.getOriginalFilename(), fileDocx.getContentType(),
				(int) fileDocx.getSize(), contenutoDocx, issueValida);
		java.lang.reflect.Field idAllegatoField = Allegato.class.getDeclaredField("idAllegato");
		idAllegatoField.setAccessible(true);
		idAllegatoField.set(allegatoSalvato, 400);

		when(allegatoDAO.save(any(Allegato.class))).thenReturn(allegatoSalvato);

		Map<String, Object> result = allegatoController.uploadAllegato(fileDocx, idIssue);

		assertNotNull(result);
		assertEquals(400, result.get("idAllegato"));

		ArgumentCaptor<Allegato> captor = ArgumentCaptor.forClass(Allegato.class);
		verify(allegatoDAO).save(captor.capture());
		assertTrue(captor.getValue().getTipoFile().contains("wordprocessingml"));
	}

	/*
	 TEST 11: uploadAllegato - ContentType null
	 CE: Tipo file non specificato
	 Atteso: InvalidFieldException
	 */
	@Test
	void testUploadAllegato_ContentTypeNull_ThrowsInvalidFieldException() {
		MockMultipartFile file = new MockMultipartFile("file", "test.jpg", null, "contenuto".getBytes());

		InvalidFieldException exception = assertThrows(InvalidFieldException.class,
				() -> allegatoController.uploadAllegato(file, 1));

		assertTrue(exception.getMessage().contains("non supportato"));

		verify(issueDAO, never()).findById(any());
		verify(allegatoDAO, never()).save(any());
	}
	
	/*
	 TEST 12: uploadAllegato - File da 10MB + 1 byte
	 CE: Appena oltre il limite (frontiera)
	 Atteso: InvalidFieldException (dimensione superata)
	 */
	@Test
	void testUploadAllegato_File10MBPlus1Byte_ThrowsException() {
		byte[] oversized = new byte[10 * 1024 * 1024 + 1];
		MockMultipartFile file = new MockMultipartFile("file", "big.jpg", "image/jpeg", oversized);

		InvalidFieldException exception = assertThrows(InvalidFieldException.class,
				() -> allegatoController.uploadAllegato(file, 1));

		assertTrue(exception.getMessage().contains("dimensione massima"));

		verify(issueDAO, never()).findById(any());
		verify(allegatoDAO, never()).save(any());
	}

	/*
	 TEST 13: uploadAllegato - Nome file null
	 CE: Nome non specificato
	 Atteso: InvalidFieldException
	 */
	@Test
	void testUploadAllegato_NomeFileNull_ThrowsInvalidFieldException() {
		MockMultipartFile file = new MockMultipartFile("file", null, "image/jpeg", "content".getBytes());

		InvalidFieldException exception = assertThrows(InvalidFieldException.class,
				() -> allegatoController.uploadAllegato(file, 1));

		assertTrue(exception.getMessage().contains("Nome file mancante"));

		
		verify(issueDAO, never()).findById(any());
		verify(allegatoDAO, never()).save(any());
	}
}