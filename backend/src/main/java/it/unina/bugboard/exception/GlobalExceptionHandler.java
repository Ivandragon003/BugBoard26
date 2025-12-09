package it.unina.bugboard.exception;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final String MESSAGE_KEY = "message";
    private static final String ERROR_KEY = "error";  // ✅ Mantieni per retrocompatibilità
    private static final String DETTAGLI_KEY = "dettagli";

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(NotFoundException e) {
        Map<String, String> response = new HashMap<>();
        response.put(MESSAGE_KEY, e.getMessage());
        response.put(ERROR_KEY, e.getMessage());  // ✅ Duplica per compatibilità
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(AlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleAlreadyExists(AlreadyExistsException e) {
        Map<String, String> response = new HashMap<>();
        response.put(MESSAGE_KEY, e.getMessage());
        response.put(ERROR_KEY, e.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler(InvalidInputException.class)
    public ResponseEntity<Map<String, String>> handleInvalidInput(InvalidInputException e) {
        Map<String, String> response = new HashMap<>();
        response.put(MESSAGE_KEY, e.getMessage());
        response.put(ERROR_KEY, e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Map<String, String>> handleUnauthorized(UnauthorizedException e) {
        Map<String, String> response = new HashMap<>();
        response.put(MESSAGE_KEY, e.getMessage());
        response.put(ERROR_KEY, e.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(InvalidFieldException.class)
    public ResponseEntity<Map<String, String>> handleInvalidField(InvalidFieldException e) {
        Map<String, String> response = new HashMap<>();
        response.put(MESSAGE_KEY, e.getMessage());  // ✅ Per il nuovo codice
        response.put(ERROR_KEY, e.getMessage());    // ✅ Per il vecchio codice
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(IOException.class)
    public ResponseEntity<Map<String, String>> handleIOException(IOException e) {
        Map<String, String> response = new HashMap<>();
        response.put(MESSAGE_KEY, "Errore durante l'operazione sul file");
        response.put(ERROR_KEY, "Errore durante l'operazione sul file");
        response.put(DETTAGLI_KEY, e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneric(Exception e) {
        Map<String, String> response = new HashMap<>();
        response.put(MESSAGE_KEY, "Errore interno del server");
        response.put(ERROR_KEY, "Errore interno del server");
        response.put(DETTAGLI_KEY, e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
