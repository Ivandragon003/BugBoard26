package it.unina.bugboard.config;

import it.unina.bugboard.dao.UtenzaDAO;
import it.unina.bugboard.model.Ruolo;
import it.unina.bugboard.model.Utenza;
import it.unina.bugboard.util.PasswordUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Autowired
    private PasswordUtil passwordUtil;

    @Bean
    CommandLineRunner initDatabase(UtenzaDAO utenzaDAO) {
        return args -> {
            // Verifica se esiste già un utente
            if (utenzaDAO.count() == 0) {
                System.out.println("Creazione primo utente admin...");
                
                // Crea il primo utente admin
                Utenza admin = new Utenza(
                    "Mario",                              // nome
                    "Rossi",                              // cognome
                    "admin@bugboard.it",                  // email
                    passwordUtil.hashPassword("admin123"), // password hashata con PasswordUtil
                    Ruolo.Amministratore,                 // ruolo
                    null                                  // creatore (temporaneo)
                );
                
                // Salva una prima volta
                admin = utenzaDAO.save(admin);
                
                // Imposta se stesso come creatore
                admin.setCreatore(admin);
                utenzaDAO.save(admin);
                
                System.out.println("✓ Utente admin creato con successo!");
                System.out.println("  Email: admin@bugboard.it");
                System.out.println("  Password: admin123");
            } else {
                System.out.println("Database già popolato, skip inizializzazione.");
            }
        };
    }
}