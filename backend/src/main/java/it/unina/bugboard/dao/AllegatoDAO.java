package it.unina.bugboard.dao;

import it.unina.bugboard.model.Allegato;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AllegatoDAO extends JpaRepository<Allegato, Integer> {

	List<Allegato> findByIssueIdIssue(Integer idIssue);

	Long countByIssueIdIssue(Integer idIssue);

	@Query("SELECT SUM(a.dimensione) FROM Allegato a WHERE a.issue.idIssue = :idIssue")
	Long sumDimensioniByIssue(@Param("idIssue") Integer idIssue);

	@Query("SELECT a FROM Allegato a WHERE a.issue.idIssue = :idIssue ORDER BY a.dimensione DESC")
	List<Allegato> findAllegatiByIssueOrderByDimensioneDesc(@Param("idIssue") Integer idIssue);

}