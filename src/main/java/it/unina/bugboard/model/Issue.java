package it.unina.bugboard.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import it.unina.bugboard.exception.InvalidFieldException;


@Entity
@Table(name = "issue")
public class Issue {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "idissue")
	private Integer idIssue;

	@Column(nullable = false, length = 100)
	private String titolo;

	@Column(nullable = false, columnDefinition = "TEXT")
	private String descrizione;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private Priorita priorita;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private Stato stato;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private Tipo tipo;

	@Column(nullable = false)
	private Boolean archiviata = false;

	@Column(name = "dataarchiviazione")
	private LocalDateTime dataArchiviazione;

	@Column(name = "datacreazione", nullable = false)
	private LocalDateTime dataCreazione;

	@Column(name = "dataultimamodifica", nullable = false)
	private LocalDateTime dataUltimaModifica;

	@Column(name = "datarisoluzione")
	private LocalDateTime dataRisoluzione;

	@ManyToOne
	@JoinColumn(name = "idcreatore")
	private Utenza creatore;

	@ManyToOne
	@JoinColumn(name = "idarchiviatore")
	private Utenza archiviatore;

	@ManyToMany
	@JoinTable(name = "assegnazione", joinColumns = @JoinColumn(name = "idissue"), inverseJoinColumns = @JoinColumn(name = "idutente"))
	@JsonIgnore
	private List<Utenza> utentiAssegnati = new ArrayList<>();

	@OneToMany(mappedBy = "issue", cascade = CascadeType.ALL, orphanRemoval = true)
	@JsonIgnore
	private List<Allegato> allegati = new ArrayList<>();


	public Issue() {
		this.dataCreazione = LocalDateTime.now();
		this.dataUltimaModifica = LocalDateTime.now();
	}

	public Issue(String titolo, String descrizione, Priorita priorita, Stato stato, Tipo tipo, Utenza creatore) {
		this();
		setTitolo(titolo);
		setDescrizione(descrizione);
		setPriorita(priorita);
		setStato(stato);
		setTipo(tipo);
		setCreatore(creatore);
	}

	public Integer getIdIssue() {
		return idIssue;
	}

	public void setIdIssue(Integer idIssue) {
		this.idIssue = idIssue;
	}

	public String getTitolo() {
		return titolo;
	}

	public void setTitolo(String titolo) {
		if (titolo == null || titolo.isBlank())
			throw new InvalidFieldException("Il titolo non può essere vuoto");
		this.titolo = titolo;
	}

	public String getDescrizione() {
		return descrizione;
	}

	public void setDescrizione(String descrizione) {
		if (descrizione == null || descrizione.isBlank())
			throw new InvalidFieldException("La descrizione non può essere vuota");
		this.descrizione = descrizione;
	}

	public Priorita getPriorita() {
		return priorita;
	}

	public void setPriorita(Priorita priorita) {
		if (priorita == null)
			throw new InvalidFieldException("La priorità non può essere null");
		this.priorita = priorita;
	}

	public Stato getStato() {
		return stato;
	}

	public void setStato(Stato stato) {
		if (stato == null)
			throw new InvalidFieldException("Lo stato non può essere null");
		this.stato = stato;
	}

	public Tipo getTipo() {
		return tipo;
	}

	public void setTipo(Tipo tipo) {
		if (tipo == null)
			throw new InvalidFieldException("Il tipo non può essere null");
		this.tipo = tipo;
	}

	public Boolean getArchiviata() {
		return archiviata;
	}

	public void setArchiviata(Boolean archiviata) {
		if (archiviata == null)
			throw new InvalidFieldException("Il campo archiviata non può essere null");
		this.archiviata = archiviata;
	}

	public LocalDateTime getDataArchiviazione() {
		return dataArchiviazione;
	}

	public void setDataArchiviazione(LocalDateTime dataArchiviazione) {
		this.dataArchiviazione = dataArchiviazione;
	}

	public LocalDateTime getDataCreazione() {
		return dataCreazione;
	}

	public void setDataCreazione(LocalDateTime dataCreazione) {
		if (dataCreazione == null)
			throw new InvalidFieldException("La data di creazione non può essere null");
		this.dataCreazione = dataCreazione;
	}

	public LocalDateTime getDataUltimaModifica() {
		return dataUltimaModifica;
	}

	public void setDataUltimaModifica(LocalDateTime dataUltimaModifica) {
		if (dataUltimaModifica == null)
			throw new InvalidFieldException("La data di ultima modifica non può essere null");
		this.dataUltimaModifica = dataUltimaModifica;
	}

	public LocalDateTime getDataRisoluzione() {
		return dataRisoluzione;
	}

	public void setDataRisoluzione(LocalDateTime dataRisoluzione) {
		this.dataRisoluzione = dataRisoluzione;
	}

	public Utenza getCreatore() {
		return creatore;
	}

	public void setCreatore(Utenza creatore) {
		if (creatore == null)
			throw new InvalidFieldException("Il creatore non può essere null");
		this.creatore = creatore;
	}

	public Utenza getArchiviatore() {
		return archiviatore;
	}

	public void setArchiviatore(Utenza archiviatore) {
		this.archiviatore = archiviatore;
	}

	public List<Utenza> getUtentiAssegnati() {
		return utentiAssegnati;
	}

	public void setUtentiAssegnati(List<Utenza> utentiAssegnati) {
		this.utentiAssegnati = utentiAssegnati;
	}

	public List<Allegato> getAllegati() {
		return allegati;
	}

	public void setAllegati(List<Allegato> allegati) {
		this.allegati = allegati;
	}

}