package it.unina.bugboard.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import it.unina.bugboard.model.Priorita;
import org.postgresql.util.PGobject;
import java.sql.SQLException;

@Converter(autoApply = true) 
public class PrioritaConverter implements AttributeConverter<Priorita, PGobject> {

    @Override
    public PGobject convertToDatabaseColumn(Priorita attribute) {
        if (attribute == null) return null;
        PGobject pgObject = new PGobject();
        pgObject.setType("priorita"); 
        try {
            pgObject.setValue(attribute.name());
        } catch (SQLException e) {
            throw new RuntimeException("Errore conversione Priorita", e);
        }
        return pgObject;
    }

    @Override
    public Priorita convertToEntityAttribute(PGobject dbData) {
        if (dbData == null) return null;
        return Priorita.valueOf(dbData.getValue());
    }
}
