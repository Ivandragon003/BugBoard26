package it.unina.bugboard.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.hibernate.type.SqlTypes;
import it.unina.bugboard.exception.InvalidFieldException;
import java.time.LocalDate;

@Entity
@Table(name = "allegato")
public class Allegato {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "idallegato")
	private Integer idAllegato;

	@Column(name = "nomefile", nullable = false, length = 255)
	private String nomeFile;

	@Column(name = "tipofile", nullable = false, length = 100)
	private String tipoFile;

	@Column(name = "dimensione", nullable = false)
	private Integer dimensione;

	// ✅ FIX DEFINITIVO: Usa JdbcTypeCode per forzare BYTEA
	@Lob
	@Basic(fetch = FetchType.LAZY)
	@Column(name = "filedata", nullable = false)
	@JdbcTypeCode(SqlTypes.VARBINARY) // Forza PostgreSQL BYTEA
	@JsonIgnore
	private byte[] fileData;

	@Column(name = "datacaricamento", nullable = false)
	private LocalDate dataCaricamento;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "idissue", nullable = false, referencedColumnName = "idissue")
	@OnDelete(action = OnDeleteAction.CASCADE)
	@JsonIgnore
	private Issue issue;


	public Allegato() {
		this.dataCaricamento = LocalDate.now();
	}

	public Allegato(String nomeFile, String tipoFile, Integer dimensione, byte[] fileData, Issue issue) {
		this();
		setNomeFile(nomeFile);
		setTipoFile(tipoFile);
		setDimensione(dimensione);
		setFileData(fileData);
		setIssue(issue);
	}

	public Integer getIdAllegato() {
		return idAllegato;
	}

	public void setIdAllegato(Integer idAllegato) {
		this.idAllegato = idAllegato;
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

	public byte[] getFileData() {
		return fileData;
	}

	public void setFileData(byte[] fileData) {
		if (fileData == null || fileData.length == 0)
			throw new InvalidFieldException("I dati del file non possono essere vuoti");
		this.fileData = fileData;
	}

	public LocalDate getDataCaricamento() {
		return dataCaricamento;
	}

	public void setDataCaricamento(LocalDate dataCaricamento) {
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
}