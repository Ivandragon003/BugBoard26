package it.unina.bugboard.util;

import it.unina.bugboard.dao.UtenzaDAO;
import it.unina.bugboard.exception.InvalidFieldException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.regex.Pattern;

@Component
public class ValidationUtil {
    
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );
    
    private static final Pattern NOME_COGNOME_PATTERN = Pattern.compile(
        "^[A-Za-zÀ-ÿ\\s']+$"
    );
    
    @Autowired
    private UtenzaDAO utenzaDAO;
    
    public void validaEmailFormat(String email) {
        if (email == null || !EMAIL_PATTERN.matcher(email).matches()) {
            throw new InvalidFieldException("Email non valida");
        }
    }
    
    public void validaUniqueEmail(String email) {
        validaEmailFormat(email);
        if (utenzaDAO.existsByEmail(email)) {
            throw new InvalidFieldException("Email già registrata");
        }
    }
    
    public void validaPassword(String password) {
        if (password == null || password.length() < 6) {
            throw new InvalidFieldException("Password troppo corta (minimo 6 caratteri)");
        }
    }
    
    public void validaCampoNonVuoto(String campo, String nomeCampo) {
        if (campo == null || campo.isBlank()) {
            throw new InvalidFieldException("Campo " + nomeCampo + " non può essere vuoto");
        }
    }
    
    public void validaNomeCognome(String campo, String tipoCampo) {
        if (campo == null || campo.isBlank()) {
            throw new InvalidFieldException("Il campo " + tipoCampo + " non può essere vuoto");
        }
        
        String campoTrimmed = campo.trim();
        
        if (campoTrimmed.length() < 2) {
            throw new InvalidFieldException("Il campo " + tipoCampo + " deve contenere almeno 2 caratteri");
        }
        
        if (!NOME_COGNOME_PATTERN.matcher(campoTrimmed).matches()) {
            throw new InvalidFieldException(
                "Il campo " + tipoCampo + " può contenere solo lettere, spazi e apostrofi"
            );
        }
    }
}