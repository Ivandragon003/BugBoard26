package it.unina.bugboard.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import it.unina.bugboard.exception.InvalidFieldException;

@Entity
@Table(name = "team")
public class Team {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idteam")
    private Integer idTeam;
    
    @Column(nullable = false, unique = true, length = 100)
    private String nome;
    
    @Column(columnDefinition = "TEXT")
    private String descrizione;
    
    // Un team ha un creatore (amministratore)
    @ManyToOne
    @JoinColumn(name = "idcreatore", nullable = false)
    private Utenza creatore;
    
    // Membri del team (relazione many-to-many)
    @ManyToMany
    @JoinTable(
        name = "appartenenza",
        joinColumns = @JoinColumn(name = "idteam"),
        inverseJoinColumns = @JoinColumn(name = "idutente")
    )
    private List<Utenza> membri = new ArrayList<>();
    
    // Issue associate al team
    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Issue> issues = new ArrayList<>();
    
    @Column(nullable = false)
    private Boolean attivo = true;
    
    public Team() {
    }
    
    public Team(String nome, String descrizione, Utenza creatore) {
        setNome(nome);
        setDescrizione(descrizione);
        setCreatore(creatore);
    }
    
    // Getters e Setters
    
    public Integer getIdTeam() {
        return idTeam;
    }
    
    public void setIdTeam(Integer idTeam) {
        this.idTeam = idTeam;
    }
    
    public String getNome() {
        return nome;
    }
    
    public void setNome(String nome) {
        if (nome == null || nome.isBlank()) {
            throw new InvalidFieldException("Il nome del team non può essere vuoto");
        }
        this.nome = nome;
    }
    
    public String getDescrizione() {
        return descrizione;
    }
    
    public void setDescrizione(String descrizione) {
        this.descrizione = descrizione;
    }
    
    public Utenza getCreatore() {
        return creatore;
    }
    
    public void setCreatore(Utenza creatore) {
        if (creatore == null) {
            throw new InvalidFieldException("Il creatore del team non può essere null");
        }
        this.creatore = creatore;
    }
    
    public List<Utenza> getMembri() {
        return membri;
    }
    
    public void setMembri(List<Utenza> membri) {
        this.membri = membri;
    }
    
    public List<Issue> getIssues() {
        return issues;
    }
    
    public void setIssues(List<Issue> issues) {
        this.issues = issues;
    }
    
    public Boolean getAttivo() {
        return attivo;
    }
    
    public void setAttivo(Boolean attivo) {
        if (attivo == null) {
            throw new InvalidFieldException("Lo stato attivo non può essere null");
        }
        this.attivo = attivo;
    }
    
    public void aggiungiMembro(Utenza utente) {
        if (!membri.contains(utente)) {
            membri.add(utente);
        }
    }
    
    public void rimuoviMembro(Utenza utente) {
        membri.remove(utente);
    }
    
    public boolean contieneMembro(Utenza utente) {
        return membri.contains(utente);
    }
}