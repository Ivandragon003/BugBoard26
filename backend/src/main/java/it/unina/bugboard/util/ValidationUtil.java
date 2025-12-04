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
}
