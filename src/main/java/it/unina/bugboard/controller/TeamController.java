package it.unina.bugboard.controller;

import it.unina.bugboard.dao.TeamDAO;
import it.unina.bugboard.dao.UtenzaDAO;
import it.unina.bugboard.model.Ruolo;
import it.unina.bugboard.model.Team;
import it.unina.bugboard.model.Utenza;
import it.unina.bugboard.exception.InvalidFieldException;
import it.unina.bugboard.exception.NotFoundException;
import it.unina.bugboard.exception.AlreadyExistsException;
import it.unina.bugboard.util.AccessTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/team")
public class TeamController {

    @Autowired
    private TeamDAO teamDAO;

    @Autowired
    private UtenzaDAO utenzaDAO;

    @Autowired
    private AccessTokenUtil accessTokenUtil;

    // ---------------- CREA TEAM (solo amministratore) ----------------
    @PostMapping("/crea")
    public Map<String, Object> creaTeam(
            @RequestBody Map<String, String> teamData,
            @RequestHeader("Authorization") String token) {

        Utenza creatore = accessTokenUtil.verificaToken(token.replace("Bearer ", ""));

        if (!creatore.getRuolo().equals(Ruolo.Amministratore)) {
            throw new InvalidFieldException("Solo gli amministratori possono creare team");
        }

        if (!creatore.getStato()) {
            throw new InvalidFieldException("Account non attivo");
        }

        String nome = teamData.get("nome");
        String descrizione = teamData.get("descrizione");

        if (nome == null || nome.isBlank()) {
            throw new InvalidFieldException("Il nome del team è obbligatorio");
        }

        // Verifica unicità del nome
        if (teamDAO.existsByNome(nome)) {
            throw new AlreadyExistsException("Esiste già un team con questo nome");
        }

        Team team = new Team(nome, descrizione, creatore);
        Team teamSalvato = teamDAO.save(team);

        return Map.of(
            "message", "Team creato con successo",
            "team", Map.of(
                "id", teamSalvato.getIdTeam(),
                "nome", teamSalvato.getNome(),
                "descrizione", teamSalvato.getDescrizione() != null ? teamSalvato.getDescrizione() : "",
                "creatore", Map.of(
                    "id", creatore.getIdUtente(),
                    "nome", creatore.getNome(),
                    "cognome", creatore.getCognome()
                )
            )
        );
    }

    // ---------------- MODIFICA TEAM ----------------
    @PutMapping("/modifica/{id}")
    @Transactional
    public Map<String, Object> modificaTeam(
            @PathVariable Integer id,
            @RequestBody Map<String, String> teamData,
            @RequestHeader("Authorization") String token) {

        Utenza utenteCorrente = accessTokenUtil.verificaToken(token.replace("Bearer ", ""));

        if (!utenteCorrente.getRuolo().equals(Ruolo.Amministratore)) {
            throw new InvalidFieldException("Solo gli amministratori possono modificare i team");
        }

        Team team = teamDAO.findById(id)
                .orElseThrow(() -> new NotFoundException("Team non trovato con id: " + id));

        if (teamData.containsKey("nome")) {
            String nuovoNome = teamData.get("nome");
            if (teamDAO.existsByNome(nuovoNome) && !team.getNome().equals(nuovoNome)) {
                throw new AlreadyExistsException("Esiste già un team con questo nome");
            }
            team.setNome(nuovoNome);
        }

        if (teamData.containsKey("descrizione")) {
            team.setDescrizione(teamData.get("descrizione"));
        }

        Team teamAggiornato = teamDAO.save(team);

        return Map.of(
            "message", "Team aggiornato con successo",
            "team", Map.of(
                "id", teamAggiornato.getIdTeam(),
                "nome", teamAggiornato.getNome(),
                "descrizione", teamAggiornato.getDescrizione() != null ? teamAggiornato.getDescrizione() : ""
            )
        );
    }

    // ---------------- AGGIUNGI MEMBRO AL TEAM ----------------
    @PostMapping("/{idTeam}/aggiungi-membro/{idUtente}")
    @Transactional
    public Map<String, Object> aggiungiMembro(
            @PathVariable Integer idTeam,
            @PathVariable Integer idUtente,
            @RequestHeader("Authorization") String token) {

        Utenza utenteCorrente = accessTokenUtil.verificaToken(token.replace("Bearer ", ""));

        if (!utenteCorrente.getRuolo().equals(Ruolo.Amministratore)) {
            throw new InvalidFieldException("Solo gli amministratori possono aggiungere membri ai team");
        }

        Team team = teamDAO.findById(idTeam)
                .orElseThrow(() -> new NotFoundException("Team non trovato con id: " + idTeam));

        Utenza utente = utenzaDAO.findById(idUtente)
                .orElseThrow(() -> new NotFoundException("Utente non trovato con id: " + idUtente));

        if (!utente.getStato()) {
            throw new InvalidFieldException("Non è possibile aggiungere un utente disattivato");
        }

        if (team.contieneMembro(utente)) {
            throw new AlreadyExistsException("L'utente è già membro del team");
        }

        team.aggiungiMembro(utente);
        teamDAO.save(team);

        return Map.of(
            "message", "Membro aggiunto con successo",
            "utente", Map.of(
                "id", utente.getIdUtente(),
                "nome", utente.getNome(),
                "cognome", utente.getCognome(),
                "email", utente.getEmail()
            )
        );
    }

    // ---------------- RIMUOVI MEMBRO DAL TEAM ----------------
    @DeleteMapping("/{idTeam}/rimuovi-membro/{idUtente}")
    @Transactional
    public Map<String, String> rimuoviMembro(
            @PathVariable Integer idTeam,
            @PathVariable Integer idUtente,
            @RequestHeader("Authorization") String token) {

        Utenza utenteCorrente = accessTokenUtil.verificaToken(token.replace("Bearer ", ""));

        if (!utenteCorrente.getRuolo().equals(Ruolo.Amministratore)) {
            throw new InvalidFieldException("Solo gli amministratori possono rimuovere membri dai team");
        }

        Team team = teamDAO.findById(idTeam)
                .orElseThrow(() -> new NotFoundException("Team non trovato con id: " + idTeam));

        Utenza utente = utenzaDAO.findById(idUtente)
                .orElseThrow(() -> new NotFoundException("Utente non trovato con id: " + idUtente));

        if (!team.contieneMembro(utente)) {
            throw new NotFoundException("L'utente non è membro del team");
        }

        team.rimuoviMembro(utente);
        teamDAO.save(team);

        return Map.of("message", "Membro rimosso con successo");
    }

    // ---------------- VISUALIZZA MEMBRI DI UN TEAM ----------------
    @GetMapping("/{idTeam}/membri")
    public List<Utenza> visualizzaMembri(@PathVariable Integer idTeam) {
        Team team = teamDAO.findById(idTeam)
                .orElseThrow(() -> new NotFoundException("Team non trovato con id: " + idTeam));

        return team.getMembri();
    }

    // ---------------- VISUALIZZA TUTTI I TEAM ----------------
    @GetMapping("/visualizza-lista")
    public List<Team> visualizzaListaTeam(@RequestParam(required = false) Boolean attivo) {
        return attivo != null ? teamDAO.findByAttivo(attivo) : teamDAO.findAllByOrderByNomeAsc();
    }

    // ---------------- VISUALIZZA SINGOLO TEAM ----------------
    @GetMapping("/visualizza/{id}")
    public Team visualizzaTeam(@PathVariable Integer id) {
        return teamDAO.findById(id)
                .orElseThrow(() -> new NotFoundException("Team non trovato con id: " + id));
    }

    // ---------------- CERCA TEAM PER NOME ----------------
    @GetMapping("/cerca")
    public List<Team> cercaTeam(@RequestParam String nome) {
        return teamDAO.findByNomeContainingIgnoreCase(nome);
    }

    // ---------------- DISATTIVA TEAM ----------------
    @PatchMapping("/{id}/disattiva")
    @Transactional
    public Map<String, String> disattivaTeam(
            @PathVariable Integer id,
            @RequestHeader("Authorization") String token) {

        Utenza utenteCorrente = accessTokenUtil.verificaToken(token.replace("Bearer ", ""));

        if (!utenteCorrente.getRuolo().equals(Ruolo.Amministratore)) {
            throw new InvalidFieldException("Solo gli amministratori possono disattivare team");
        }

        Team team = teamDAO.findById(id)
                .orElseThrow(() -> new NotFoundException("Team non trovato con id: " + id));

        if (!team.getAttivo()) {
            throw new InvalidFieldException("Il team è già disattivato");
        }

        team.setAttivo(false);
        teamDAO.save(team);

        return Map.of("message", "Team disattivato con successo");
    }

    // ---------------- RIATTIVA TEAM ----------------
    @PatchMapping("/{id}/riattiva")
    @Transactional
    public Map<String, String> riattivaTeam(
            @PathVariable Integer id,
            @RequestHeader("Authorization") String token) {

        Utenza utenteCorrente = accessTokenUtil.verificaToken(token.replace("Bearer ", ""));

        if (!utenteCorrente.getRuolo().equals(Ruolo.Amministratore)) {
            throw new InvalidFieldException("Solo gli amministratori possono riattivare team");
        }

        Team team = teamDAO.findById(id)
                .orElseThrow(() -> new NotFoundException("Team non trovato con id: " + id));

        if (team.getAttivo()) {
            throw new InvalidFieldException("Il team è già attivo");
        }

        team.setAttivo(true);
        teamDAO.save(team);

        return Map.of("message", "Team riattivato con successo");
    }

    // ---------------- ELIMINA TEAM ----------------
    @DeleteMapping("/elimina/{id}")
    @Transactional
    public Map<String, String> eliminaTeam(
            @PathVariable Integer id,
            @RequestHeader("Authorization") String token) {

        Utenza utenteCorrente = accessTokenUtil.verificaToken(token.replace("Bearer ", ""));

        if (!utenteCorrente.getRuolo().equals(Ruolo.Amministratore)) {
            throw new InvalidFieldException("Solo gli amministratori possono eliminare team");
        }

        Team team = teamDAO.findById(id)
                .orElseThrow(() -> new NotFoundException("Team non trovato con id: " + id));

        teamDAO.delete(team);

        return Map.of("message", "Team eliminato con successo");
    }

    // ---------------- STATISTICHE TEAM ----------------
    @GetMapping("/statistiche")
    public Map<String, Object> visualizzaStatistiche() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totali", teamDAO.count());
        stats.put("attivi", teamDAO.countByAttivo(true));
        stats.put("disattivati", teamDAO.countByAttivo(false));
        return stats;
    }

    // ---------------- TEAM DI UN UTENTE ----------------
    @GetMapping("/utente/{idUtente}")
    public List<Team> getTeamsByUtente(@PathVariable Integer idUtente) {
        if (!utenzaDAO.existsById(idUtente)) {
            throw new NotFoundException("Utente non trovato con id: " + idUtente);
        }
        return teamDAO.findTeamsByMembroId(idUtente);
    }

    // ---------------- TEAM CREATI DA UN AMMINISTRATORE ----------------
    @GetMapping("/creati-da/{idCreatore}")
    public List<Team> getTeamsCreatiDa(@PathVariable Integer idCreatore) {
        Utenza creatore = utenzaDAO.findById(idCreatore)
                .orElseThrow(() -> new NotFoundException("Utente non trovato con id: " + idCreatore));

        if (!creatore.getRuolo().equals(Ruolo.Amministratore)) {
            throw new InvalidFieldException("L'utente specificato non è un amministratore");
        }

        return teamDAO.findByCreatoreIdUtente(idCreatore);
    }
}