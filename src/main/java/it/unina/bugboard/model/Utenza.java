package it.unina.bugboard.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;
import com.fasterxml.jackson.annotation.JsonIgnore;
import it.unina.bugboard.exception.InvalidFieldException;

@Entity
@Table(name = "utenza")
public class Utenza {

	private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)  
	@Column(name = "idutente")
	private Integer idUtente;  

	@ManyToOne
	@JoinColumn(name = "idcreatore", nullable = false)
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

	@Enumerated(EnumType.STRING)
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
	
	public String toStringNome() {
	    return "Nome: " + nome;
	}

	public String toStringCognome() {
	    return "Cognome: " + cognome;
	}

	public String toStringEmail() {
	    return "Email: " + email;
	}

	public String toStringPassword() {
	    return "Password: " + password;
	}

	public String toStringRuolo() {
	    return "Ruolo: " + ruolo;
	}

	public String toStringId() {
	    return "IdUtente: " + idUtente;
	}

	public String toStringCreatore() {
	    return creatore != null ?
	            "Creatore: " + creatore.getIdUtente() :
	            "Creatore: null";
	}

	public String toStringStato() {
	    return "Stato: " + (stato ? "Attivo" : "Disattivo");
	}

}
