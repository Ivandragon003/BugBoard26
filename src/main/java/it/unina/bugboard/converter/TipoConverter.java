package it.unina.bugboard.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import it.unina.bugboard.model.Tipo;
import org.postgresql.util.PGobject;
import java.sql.SQLException;

@Converter(autoApply = true)
public class TipoConverter implements AttributeConverter<Tipo, PGobject> {

	@Override
	public PGobject convertToDatabaseColumn(Tipo attribute) {
		if (attribute == null)
			return null;

		PGobject pgObject = new PGobject();
		pgObject.setType("tipo"); 
		try {
			pgObject.setValue(attribute.name());
		} catch (SQLException e) {
			throw new RuntimeException("Errore conversione Tipo", e);
		}
		return pgObject;
	}

	@Override
	public Tipo convertToEntityAttribute(PGobject dbData) {
		if (dbData == null)
			return null;
		return Tipo.valueOf(dbData.getValue());
	}

}
