package it.unina.bugboard.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import it.unina.bugboard.model.Ruolo;
import org.postgresql.util.PGobject;

import java.sql.SQLException;

@Converter(autoApply = true)
public class RuoloConverter implements AttributeConverter<Ruolo, Object> {

    @Override
    public Object convertToDatabaseColumn(Ruolo attribute) {
        if (attribute == null) {
            return null;
        }
        
        try {
            PGobject pgObject = new PGobject();
            pgObject.setType("ruolo");
            pgObject.setValue(attribute.name());
            return pgObject;
        } catch (SQLException e) {
            throw new RuntimeException("Errore nella conversione di Ruolo", e);
        }
    }

    @Override
    public Ruolo convertToEntityAttribute(Object dbData) {
        if (dbData == null) {
            return null;
        }
        
        String value;
        if (dbData instanceof PGobject) {
            value = ((PGobject) dbData).getValue();
        } else {
            value = dbData.toString();
        }
        
        return Ruolo.valueOf(value);
    }
}