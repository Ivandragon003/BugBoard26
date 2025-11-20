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

	List<Allegato> findByIssue(Issue issue);

	List<Allegato> findByIssueIdIssue(Integer idIssue);

	Optional<Allegato> findByNomeFile(String nomeFile);

	List<Allegato> findByNomeFileContainingIgnoreCase(String nomeFile);

	List<Allegato> findByTipoFile(String tipoFile);

	List<Allegato> findByTipoFileAndIssueIdIssue(String tipoFile, Integer idIssue);

	Optional<Allegato> findByPercorso(String percorso);

	List<Allegato> findByDataCaricamentoBetween(LocalDateTime dataInizio, LocalDateTime dataFine);

	List<Allegato> findByDimensioneGreaterThan(Integer dimensione);

	List<Allegato> findByDimensioneLessThan(Integer dimensione);

	List<Allegato> findByDimensioneBetween(Integer minDimensione, Integer maxDimensione);

	Long countByIssueIdIssue(Integer idIssue);

	Long countByTipoFile(String tipoFile);

	List<Allegato> findAllByOrderByDataCaricamentoDesc();

	List<Allegato> findByIssueIdIssueOrderByDataCaricamentoDesc(Integer idIssue);

	@Query("SELECT SUM(a.dimensione) FROM Allegato a WHERE a.issue.idIssue = :idIssue")
	Long sumDimensioniByIssue(@Param("idIssue") Integer idIssue);

	@Query("SELECT a FROM Allegato a WHERE a.issue.idIssue = :idIssue ORDER BY a.dimensione DESC")
	List<Allegato> findAllegatiByIssueOrderByDimensioneDesc(@Param("idIssue") Integer idIssue);

	@Query("SELECT a FROM Allegato a JOIN FETCH a.issue")
	List<Allegato> findAllWithIssue();

	void deleteByIssueIdIssue(Integer idIssue);

	void deleteByTipoFile(String tipoFile);

	boolean existsByPercorso(String percorso);

	boolean existsByIssueIdIssue(Integer idIssue);
}