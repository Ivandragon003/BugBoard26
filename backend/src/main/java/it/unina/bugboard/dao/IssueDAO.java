package it.unina.bugboard.dao;

import it.unina.bugboard.model.Issue;
import it.unina.bugboard.model.Stato;
import it.unina.bugboard.model.Priorita;
import it.unina.bugboard.model.Tipo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


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

	List<Issue> findByStatoAndPriorita(Stato stato, Priorita priorita);

	Long countByStato(Stato stato);

	Long countByArchiviataFalse();

	List<Issue> findByTitoloContainingIgnoreCase(String titolo);

	@Query("SELECT i FROM Issue i WHERE i.priorita IN :priorita AND i.archiviata = false")
	List<Issue> findIssueUrgenti(@Param("priorita") List<Priorita> priorita);

}
