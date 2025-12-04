package it.unina.bugboard.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import java.security.SecureRandom;

@Component
public class PasswordUtil {

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
    private static final String CHAR_SET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    private final SecureRandom random = new SecureRandom();

    
    public String hashPassword(String rawPassword) {
        return encoder.encode(rawPassword);
    }

    public boolean checkPassword(String rawPassword, String hashedPassword) {
        return encoder.matches(rawPassword, hashedPassword);
    }

    public String generaPassword() {
        StringBuilder password = new StringBuilder(12);
        for (int i = 0; i < 12; i++) {
            password.append(CHAR_SET.charAt(random.nextInt(CHAR_SET.length())));
        }
        return password.toString();
    }
}
