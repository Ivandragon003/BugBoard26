package it.unina.bugboard.dao;

import it.unina.bugboard.model.Team;
import it.unina.bugboard.model.Utenza;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamDAO extends JpaRepository<Team, Integer> {
    
    // Trova team per nome
    Optional<Team> findByNome(String nome);
    
    // Trova team per creatore
    List<Team> findByCreatore(Utenza creatore);
    
    List<Team> findByCreatoreIdUtente(Integer idCreatore);
    
    // Trova team attivi
    List<Team> findByAttivo(Boolean attivo);
    
    // Trova team per nome (parziale, case insensitive)
    List<Team> findByNomeContainingIgnoreCase(String nome);
    
    // Trova team di cui un utente è membro
    @Query("SELECT t FROM Team t JOIN t.membri m WHERE m.idUtente = :idUtente")
    List<Team> findTeamsByMembroId(@Param("idUtente") Integer idUtente);
    
    // Trova team di cui un utente è membro E sono attivi
    @Query("SELECT t FROM Team t JOIN t.membri m WHERE m.idUtente = :idUtente AND t.attivo = true")
    List<Team> findTeamsAttiviByMembroId(@Param("idUtente") Integer idUtente);
    
    // Conta membri in un team
    @Query("SELECT COUNT(m) FROM Team t JOIN t.membri m WHERE t.idTeam = :idTeam")
    Long countMembriInTeam(@Param("idTeam") Integer idTeam);
    
    // Conta issue associate a un team
    @Query("SELECT COUNT(i) FROM Issue i WHERE i.team.idTeam = :idTeam")
    Long countIssueInTeam(@Param("idTeam") Integer idTeam);
    
    // Conta team attivi
    Long countByAttivo(Boolean attivo);
    
    // Verifica se esiste un team con quel nome
    boolean existsByNome(String nome);
    
    // Trova tutti i team ordinati per nome
    List<Team> findAllByOrderByNomeAsc();
    
    // Trova team creati da un amministratore specifico
    @Query("SELECT t FROM Team t WHERE t.creatore.idUtente = :idCreatore AND t.creatore.ruolo = 'Amministratore'")
    List<Team> findTeamsByAmministratore(@Param("idCreatore") Integer idCreatore);
}