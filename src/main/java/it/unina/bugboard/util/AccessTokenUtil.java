package it.unina.bugboard.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import it.unina.bugboard.dao.UtenzaDAO;
import it.unina.bugboard.model.Utenza;
import it.unina.bugboard.exception.InvalidFieldException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class AccessTokenUtil {

    // RNF-1: invalidazione sessioni dopo 30 min inattività
    private static final long EXPIRATION_TIME = 30 * 60 * 1000; // 30 minuti in millisecondi
    
    @Value("${jwt.secret:mySecretKeyForBugBoardApplicationMustBe256BitsLongForHS256Algorithm}")
    private String secretKeyString;
    
    private SecretKey secretKey;
    
    @Autowired
    private UtenzaDAO utenzaDAO;

    /**
     * Genera token JWT - RNF-1: autenticazione obbligatoria
     */
    public String generaToken(Utenza utenza) {
        if (secretKey == null) {
            secretKey = Keys.hmacShaKeyFor(secretKeyString.getBytes());
        }
        
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + EXPIRATION_TIME);

        return Jwts.builder()
                .subject(utenza.getIdUtente().toString())
                .claim("email", utenza.getEmail())
                .claim("ruolo", utenza.getRuolo().toString())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(secretKey, Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Verifica token e restituisce utente - RNF-1: autenticità operazioni
     */
    public Utenza verificaToken(String token) {
        try {
            if (secretKey == null) {
                secretKey = Keys.hmacShaKeyFor(secretKeyString.getBytes());
            }
            
            // CAMBIATO: parser() invece di parserBuilder()
            Claims claims = Jwts.parser()
                    .verifyWith(secretKey)  // CAMBIATO: verifyWith invece di setSigningKey
                    .build()
                    .parseSignedClaims(token)  // CAMBIATO: parseSignedClaims invece di parseClaimsJws
                    .getPayload();  // CAMBIATO: getPayload invece di getBody

            Integer idUtente = Integer.parseInt(claims.getSubject());
            
            // Recupera utente dal database
            return utenzaDAO.findById(idUtente)
                    .orElseThrow(() -> new InvalidFieldException("Utente non trovato"));
                    
        } catch (ExpiredJwtException e) {
            throw new InvalidFieldException("Token scaduto - sessione terminata dopo 30 minuti");
        } catch (JwtException e) {
            throw new InvalidFieldException("Token non valido");
        }
    }

    /**
     * Estrae ID utente dal token
     */
    public Integer estraiIdUtente(String token) {
        if (secretKey == null) {
            secretKey = Keys.hmacShaKeyFor(secretKeyString.getBytes());
        }
        
        // CAMBIATO: parser() invece di parserBuilder()
        Claims claims = Jwts.parser()
                .verifyWith(secretKey)  // CAMBIATO: verifyWith invece di setSigningKey
                .build()
                .parseSignedClaims(token)  // CAMBIATO: parseSignedClaims invece di parseClaimsJws
                .getPayload();  // CAMBIATO: getPayload invece di getBody

        return Integer.parseInt(claims.getSubject());
    }
}
