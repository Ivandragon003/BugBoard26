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

        System.out.println("=== INVIO EMAIL ===");
        System.out.println("Destinatario: " + destinatario);
        System.out.println("Oggetto: " + oggetto);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(destinatario);
        message.setSubject(oggetto);
        message.setText(testo);
        message.setFrom("noreply@bugboard.it");

        mailSender.send(message);

        System.out.println("✅ Email inviata con successo!");
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
