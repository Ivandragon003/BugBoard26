package it.unina.bugboard.config;

import it.unina.bugboard.dao.UtenzaDAO;
import it.unina.bugboard.model.Ruolo;
import it.unina.bugboard.model.Utenza;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(UtenzaDAO utenzaDAO, PasswordEncoder passwordEncoder) {
        return args -> {
            // Verifica se esiste già un utente
            if (utenzaDAO.count() == 0) {
                System.out.println("Creazione primo utente admin...");
                
                // Crea il primo utente admin
                Utenza admin = new Utenza(
                    "Mario",                              // nome
                    "Rossi",                              // cognome
                    "admin@bugboard.it",                  // email
                    passwordEncoder.encode("admin123"),   // password hashata
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