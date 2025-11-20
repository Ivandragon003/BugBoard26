package it.unina.bugboard.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
public class EmailUtil {

    @Autowired
    private JavaMailSender mailSender;
 
    public void sendEmail(String destinatario, String oggetto, String testo) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(destinatario);
        message.setSubject(oggetto);
        message.setText(testo);
        message.setFrom("[email protected]");
        
        mailSender.send(message);
    }
 
    public void sendRecuperoPassword(String email, String nuovaPassword) {
        String testo = String.format(
            "Gentile utente,\n\n" +
            "La tua nuova password temporanea è: %s\n\n" +
            "Ti consigliamo di cambiarla dopo il primo accesso.\n\n" +
            "BugBoard Team",
            nuovaPassword
        );
        sendEmail(email, "Recupero Password - BugBoard", testo);
    }
}
