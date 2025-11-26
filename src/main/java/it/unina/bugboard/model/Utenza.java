package it.unina.bugboard.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import it.unina.bugboard.exception.InvalidFieldException;
import it.unina.bugboard.converter.RuoloConverter;

@Entity
@Table(name = "utenza")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Utenza {

	private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "idutente")
	private Integer idUtente;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "idcreatore")
	@JsonIgnore
	private Utenza creatore;

	@Column(nullable = false)
	private String nome;

	@Column(nullable = false)
	private String cognome;

	@Column(nullable = false, unique = true)
	private String email;

	@JsonIgnore
	@Column(nullable = false)
	private String password;

	@Convert(converter = RuoloConverter.class)
	@Column(nullable = false)
	private Ruolo ruolo;

	@Column(nullable = false)
	private Boolean stato = true;

	@OneToMany(mappedBy = "creatore")
	@JsonIgnore
	private List<Issue> issuesCreate = new ArrayList<>();

	public Utenza() {
	}

	public Utenza(String nome, String cognome, String email, String password, Ruolo ruolo, Utenza creatore) {
		setNome(nome);
		setCognome(cognome);
		setEmail(email);
		setPassword(password);
		setRuolo(ruolo);
		this.creatore = creatore;
	}


	public Integer getIdUtente() {
		return idUtente;
	}

	public Utenza getCreatore() {
		return creatore;
	}

	public void setCreatore(Utenza creatore) {
		this.creatore = creatore;
	}

	public String getNome() {
		return nome;
	}

	public void setNome(String nome) {
		if (nome == null || nome.isBlank())
			throw new InvalidFieldException("Campo nome non può essere vuoto");
		this.nome = nome;
	}

	public String getCognome() {
		return cognome;
	}

	public void setCognome(String cognome) {
		if (cognome == null || cognome.isBlank())
			throw new InvalidFieldException("Campo cognome non può essere vuoto");
		this.cognome = cognome;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		if (!EMAIL_PATTERN.matcher(email).matches())
			throw new InvalidFieldException("Email non valida");
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		if (password == null || password.length() < 6)
			throw new InvalidFieldException("Password troppo corta minimo 6 caratteri");
		this.password = password;
	}

	public Ruolo getRuolo() {
		return ruolo;
	}

	public void setRuolo(Ruolo ruolo) {
		this.ruolo = ruolo;
	}

	public Boolean getStato() {
		return stato;
	}

	public void setStato(Boolean stato) {
		this.stato = stato;
	}

	public List<Issue> getIssuesCreate() {
		return issuesCreate;
	}

	public void setIssuesCreate(List<Issue> issuesCreate) {
		this.issuesCreate = issuesCreate;
	}
}