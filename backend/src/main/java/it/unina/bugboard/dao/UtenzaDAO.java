package it.unina.bugboard.dao;

import it.unina.bugboard.model.Utenza;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UtenzaDAO extends JpaRepository<Utenza, Integer> {

	Optional<Utenza> findByEmail(String email);

	boolean existsByEmail(String email);

}