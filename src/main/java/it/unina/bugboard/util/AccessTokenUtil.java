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

	private static final long EXPIRATION_TIME = 30 * 60 * 1000;
    
    @Value("${jwt.secret:mySecretKeyForBugBoardApplicationMustBe256BitsLongForHS256Algorithm}")
    private String secretKeyString;
    
    private SecretKey secretKey;
    
    @Autowired
    private UtenzaDAO utenzaDAO;

    public String generaToken(Utenza utenza) {
        if (secretKey == null) {
            secretKey = Keys.hmacShaKeyFor(secretKeyString.getBytes());
        }
        
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + EXPIRATION_TIME);

        return Jwts.builder()
                .setSubject(utenza.getIdUtente().toString())
                .claim("email", utenza.getEmail())
                .claim("ruolo", utenza.getRuolo().toString())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public Utenza verificaToken(String token) {
        try {
            if (secretKey == null) {
                secretKey = Keys.hmacShaKeyFor(secretKeyString.getBytes());
            }
            
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            Integer idUtente = Integer.parseInt(claims.getSubject());
            
            return utenzaDAO.findById(idUtente)
                    .orElseThrow(() -> new InvalidFieldException("Utente non trovato"));
                    
        } catch (ExpiredJwtException e) {
            throw new InvalidFieldException("Token scaduto - sessione terminata dopo 30 minuti");
        } catch (JwtException e) {
            throw new InvalidFieldException("Token non valido");
        }
    }

    public Integer estraiIdUtente(String token) {
        if (secretKey == null) {
            secretKey = Keys.hmacShaKeyFor(secretKeyString.getBytes());
        }
        
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return Integer.parseInt(claims.getSubject());
    }
}
