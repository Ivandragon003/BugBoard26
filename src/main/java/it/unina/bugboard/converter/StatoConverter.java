package it.unina.bugboard.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import it.unina.bugboard.model.Stato;
import org.postgresql.util.PGobject;
import java.sql.SQLException;

@Converter(autoApply = true)
public class StatoConverter implements AttributeConverter<Stato, PGobject> {

	@Override
	public PGobject convertToDatabaseColumn(Stato attribute) {
		if (attribute == null)
			return null;

		PGobject pgObject = new PGobject();
		pgObject.setType("stato"); 
		try {
			pgObject.setValue(attribute.name());
		} catch (SQLException e) {
			throw new RuntimeException("Errore conversione Stato", e);
		}
		return pgObject;
	}

	@Override
	public Stato convertToEntityAttribute(PGobject dbData) {
		if (dbData == null)
			return null;
		return Stato.valueOf(dbData.getValue());
	}

}
