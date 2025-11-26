package it.unina.bugboard.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import it.unina.bugboard.model.Ruolo;
import org.postgresql.util.PGobject;

import java.sql.SQLException;

@Converter(autoApply = true)
public class RuoloConverter implements AttributeConverter<Ruolo, PGobject> {

	@Override
	public PGobject convertToDatabaseColumn(Ruolo attribute) {
		if (attribute == null)
			return null;
		PGobject pgObject = new PGobject();
		pgObject.setType("ruolo");
		try {
			pgObject.setValue(attribute.name());
		} catch (SQLException e) {
			throw new RuntimeException("Errore nella conversione di Ruolo", e);
		}
		return pgObject;
	}

	@Override
	public Ruolo convertToEntityAttribute(PGobject dbData) {
		if (dbData == null)
			return null;
		return Ruolo.valueOf(dbData.getValue());
	}
}
