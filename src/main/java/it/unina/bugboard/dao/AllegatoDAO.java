package it.unina.bugboard.dao;

import it.unina.bugboard.model.Allegato;
import it.unina.bugboard.model.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AllegatoDAO extends JpaRepository<Allegato, Integer> {

	// Query base per Issue
	List<Allegato> findByIssue(Issue issue);

	List<Allegato> findByIssueIdIssue(Integer idIssue);

	// Query per nome file
	Optional<Allegato> findByNomeFile(String nomeFile);

	List<Allegato> findByNomeFileContainingIgnoreCase(String nomeFile);

	// Query per tipo file
	List<Allegato> findByTipoFile(String tipoFile);

	List<Allegato> findByTipoFileAndIssueIdIssue(String tipoFile, Integer idIssue);

	// Query per percorso
	Optional<Allegato> findByPercorso(String percorso);

	// Query per data caricamento
	List<Allegato> findByDataCaricamentoBetween(LocalDateTime dataInizio, LocalDateTime dataFine);

	// Query per dimensione
	List<Allegato> findByDimensioneGreaterThan(Integer dimensione);

	List<Allegato> findByDimensioneLessThan(Integer dimensione);

	List<Allegato> findByDimensioneBetween(Integer minDimensione, Integer maxDimensione);

	// Count
	Long countByIssueIdIssue(Integer idIssue);

	Long countByTipoFile(String tipoFile);

	// Ordinamento per data caricamento
	List<Allegato> findAllByOrderByDataCaricamentoDesc();

	// METODO MANCANTE - Allegati di una issue ordinati per data
	List<Allegato> findByIssueIdIssueOrderByDataCaricamentoDesc(Integer idIssue);

	// Query custom con @Query
	@Query("SELECT SUM(a.dimensione) FROM Allegato a WHERE a.issue.idIssue = :idIssue")
	Long sumDimensioniByIssue(@Param("idIssue") Integer idIssue);

	@Query("SELECT a FROM Allegato a WHERE a.issue.idIssue = :idIssue ORDER BY a.dimensione DESC")
	List<Allegato> findAllegatiByIssueOrderByDimensioneDesc(@Param("idIssue") Integer idIssue);

	@Query("SELECT a FROM Allegato a JOIN FETCH a.issue")
	List<Allegato> findAllWithIssue();

	// Delete operations
	void deleteByIssueIdIssue(Integer idIssue);

	void deleteByTipoFile(String tipoFile);

	// Exists operations
	boolean existsByPercorso(String percorso);

	boolean existsByIssueIdIssue(Integer idIssue);
}