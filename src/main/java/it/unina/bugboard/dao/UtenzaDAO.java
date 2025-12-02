package it.unina.bugboard.dao;

import it.unina.bugboard.model.Ruolo;
import it.unina.bugboard.model.Utenza;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UtenzaDAO extends JpaRepository<Utenza, Integer> {

	Optional<Utenza> findByEmail(String email);

	List<Utenza> findByRuolo(Ruolo ruolo);

	List<Utenza> findByNome(String nome);

	List<Utenza> findByCognome(String cognome);

	List<Utenza> findByNomeAndCognome(String nome, String cognome);

	List<Utenza> findByCreatore(Utenza creatore);

	List<Utenza> findByCreatoreIdUtente(Integer idCreatore);

	List<Utenza> findByNomeContainingIgnoreCase(String nome);

	List<Utenza> findByCognomeContainingIgnoreCase(String cognome);

	List<Utenza> findByEmailContainingIgnoreCase(String email);

	@Query("SELECT u FROM Utenza u WHERE LOWER(u.nome) LIKE LOWER(CONCAT('%', :termine, '%')) OR LOWER(u.cognome) LIKE LOWER(CONCAT('%', :termine, '%'))")
	List<Utenza> searchByNomeOrCognome(@Param("termine") String termine);

	List<Utenza> findByRuoloOrderByNomeAsc(Ruolo ruolo);

	Long countByRuolo(Ruolo ruolo);

	Long countByCreatoreIdUtente(Integer idCreatore);

	boolean existsByEmail(String email);

	boolean existsByIdUtente(Integer idUtente);

	@Query("SELECT DISTINCT u FROM Utenza u JOIN Issue i ON u MEMBER OF i.utentiAssegnati")
	List<Utenza> findUtentiConIssueAssegnate();

	@Query("SELECT u FROM Utenza u JOIN Issue i ON u MEMBER OF i.utentiAssegnati WHERE i.idIssue = :idIssue")
	List<Utenza> findUtentiAssegnatiAIssue(@Param("idIssue") Integer idIssue);

	@Query("SELECT COUNT(i) FROM Issue i WHERE i.creatore.idUtente = :idUtente")
	Long countIssueCreatedByUtente(@Param("idUtente") Integer idUtente);

	@Query("SELECT COUNT(i) FROM Issue i JOIN i.utentiAssegnati u WHERE u.idUtente = :idUtente")
	Long countIssueAssegnateAUtente(@Param("idUtente") Integer idUtente);

	@Query("SELECT u FROM Utenza u WHERE u.ruolo = :ruolo AND u.idUtente != :idUtente")
	List<Utenza> findByRuoloExcludingUtente(@Param("ruolo") Ruolo ruolo, @Param("idUtente") Integer idUtente);

	List<Utenza> findAllByOrderByCognomeAscNomeAsc();

	List<Utenza> findByStato(Boolean stato);

	void deleteByCreatoreIdUtente(Integer idCreatore);
}