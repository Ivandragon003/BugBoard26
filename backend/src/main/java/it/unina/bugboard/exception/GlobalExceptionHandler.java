package it.unina.bugboard.exception;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final String ERROR_KEY = "error";
    private static final String DETTAGLI_KEY = "dettagli";

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<?> handleNotFound(NotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of(ERROR_KEY, e.getMessage()));
    }

    @ExceptionHandler(AlreadyExistsException.class)
    public ResponseEntity<?> handleAlreadyExists(AlreadyExistsException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of(ERROR_KEY, e.getMessage()));
    }

    @ExceptionHandler(InvalidInputException.class)
    public ResponseEntity<?> handleInvalidInput(InvalidInputException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of(ERROR_KEY, e.getMessage()));
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<?> handleUnauthorized(UnauthorizedException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(ERROR_KEY, e.getMessage()));
    }

    @ExceptionHandler(InvalidFieldException.class)
    public ResponseEntity<?> handleInvalidField(InvalidFieldException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of(ERROR_KEY, e.getMessage()));
    }

    @ExceptionHandler(IOException.class)
    public ResponseEntity<?> handleIOException(IOException e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    ERROR_KEY, "Errore durante l'operazione sul file",
                    DETTAGLI_KEY, e.getMessage()
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneric(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    ERROR_KEY, "Errore interno del server",
                    DETTAGLI_KEY, e.getMessage()
                ));
    }
}