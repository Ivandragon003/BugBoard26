package it.unina.bugboard.exception;

public class InvalidInputException extends RuntimeException {
	public InvalidInputException(String message) {
		super(message);
	}
}