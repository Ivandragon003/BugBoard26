package it.unina.bugboard.dao;

import it.unina.bugboard.model.Issue;
import it.unina.bugboard.model.Stato;
import it.unina.bugboard.model.Priorita;
import it.unina.bugboard.model.Tipo;
import it.unina.bugboard.model.Utenza;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface IssueDAO extends JpaRepository<Issue, Integer> {

	Optional<Issue> findByTitolo(String titolo);

	List<Issue> findByStato(Stato stato);

	List<Issue> findByPriorita(Priorita priorita);

	List<Issue> findByTipo(Tipo tipo);

	List<Issue> findByArchiviata(Boolean archiviata);

	List<Issue> findByArchiviataFalse();

	List<Issue> findByCreatore(Utenza creatore);

	List<Issue> findByCreatoreIdUtente(Integer idUtente);

	List<Issue> findByArchiviatore(Utenza archiviatore);

	List<Issue> findByStatoAndPriorita(Stato stato, Priorita priorita);

	List<Issue> findByStatoAndArchiviataFalse(Stato stato);

	List<Issue> findByDataCreazioneBetween(LocalDateTime dataInizio, LocalDateTime dataFine);

	@Query("SELECT i FROM Issue i JOIN i.utentiAssegnati u WHERE u.idUtente = :idUtente")
	List<Issue> findByUtentiAssegnatiContaining(@Param("idUtente") Integer idUtente);

	@Query("SELECT i FROM Issue i JOIN i.utentiAssegnati u WHERE u.idUtente = :idUtente AND i.stato = :stato")
	List<Issue> findByUtentiAssegnatiAndStato(@Param("idUtente") Integer idUtente, @Param("stato") Stato stato);

	List<Issue> findByPrioritaAndArchiviataFalseOrderByDataCreazioneDesc(Priorita priorita);

	Long countByStato(Stato stato);

	Long countByArchiviataFalse();

	Long countByCreatoreIdUtente(Integer idUtente);

	@Query("SELECT i FROM Issue i WHERE i.dataRisoluzione IS NOT NULL")
	List<Issue> findIssueRisolte();

	@Query("SELECT i FROM Issue i WHERE i.dataRisoluzione IS NULL AND i.archiviata = false")
	List<Issue> findIssueNonRisolte();

	List<Issue> findByTitoloContainingIgnoreCase(String titolo);

	List<Issue> findByDescrizioneContainingIgnoreCase(String descrizione);

	List<Issue> findAllByOrderByDataUltimaModificaDesc();

	@Query("SELECT i FROM Issue i WHERE i.priorita IN ('critical', 'high') AND i.archiviata = false")
	List<Issue> findIssueUrgenti();

	void deleteByArchiviataAndCreatore(Boolean archiviata, Utenza creatore);
}