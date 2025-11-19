package it.unina.bugboard.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonBackReference;
import it.unina.bugboard.exception.InvalidFieldException;

@Entity
@Table(name = "allegato")
public class Allegato {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Integer id;

	@Column(nullable = false, length = 255)
	private String percorso;

	@Column(name = "nomefile", nullable = false)
	private String nomeFile;

	@Column(name = "tipofile", nullable = false)
	private String tipoFile;

	@Column(nullable = false)
	private Integer dimensione;

	@Column(name = "datacaricamento", nullable = false)
	private LocalDateTime dataCaricamento;

	@ManyToOne
	@JoinColumn(name = "idissue", nullable = false)
	@JsonBackReference
	private Issue issue;

	public Allegato() {
		this.dataCaricamento = LocalDateTime.now();
	}

	public Allegato(String percorso, String nomeFile, String tipoFile, Integer dimensione, Issue issue) {
		this();
		setPercorso(percorso);
		setNomeFile(nomeFile);
		setTipoFile(tipoFile);
		setDimensione(dimensione);
		setIssue(issue);
	}

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getPercorso() {
		return percorso;
	}

	public void setPercorso(String percorso) {
		if (percorso == null || percorso.isBlank())
			throw new InvalidFieldException("Il percorso non può essere vuoto");
		this.percorso = percorso;
	}

	public String getNomeFile() {
		return nomeFile;
	}

	public void setNomeFile(String nomeFile) {
		if (nomeFile == null || nomeFile.isBlank())
			throw new InvalidFieldException("Il nome del file non può essere vuoto");
		this.nomeFile = nomeFile;
	}

	public String getTipoFile() {
		return tipoFile;
	}

	public void setTipoFile(String tipoFile) {
		if (tipoFile == null || tipoFile.isBlank())
			throw new InvalidFieldException("Il tipo di file non può essere vuoto");
		this.tipoFile = tipoFile;
	}

	public Integer getDimensione() {
		return dimensione;
	}

	public void setDimensione(Integer dimensione) {
		if (dimensione == null || dimensione <= 0)
			throw new InvalidFieldException("La dimensione deve essere maggiore di zero");
		this.dimensione = dimensione;
	}

	public LocalDateTime getDataCaricamento() {
		return dataCaricamento;
	}

	public void setDataCaricamento(LocalDateTime dataCaricamento) {
		if (dataCaricamento == null)
			throw new InvalidFieldException("La data di caricamento non può essere null");
		this.dataCaricamento = dataCaricamento;
	}

	public Issue getIssue() {
		return issue;
	}

	public void setIssue(Issue issue) {
		if (issue == null)
			throw new InvalidFieldException("L'issue associato non può essere null");
		this.issue = issue;
	}

	public String toStringPercorso() {
		return "Percorso: " + percorso;
	}

	public String toStringNomeFile() {
		return "Nome file: " + nomeFile;
	}

	public String toStringTipoFile() {
		return "Tipo file: " + tipoFile;
	}

	public String toStringDimensione() {
		return "Dimensione: " + dimensione + " bytes";
	}

	public String toStringDataCaricamento() {
		return "Data caricamento: " + dataCaricamento;
	}

	public String toStringIssue() {
		return "Issue ID: " + (issue != null ? issue.getIdIssue() : "null");
	}

}