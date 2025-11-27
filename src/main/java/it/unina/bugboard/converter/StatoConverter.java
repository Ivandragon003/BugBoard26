package it.unina.bugboard.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import it.unina.bugboard.model.Stato;
import org.postgresql.util.PGobject;
import java.sql.SQLException;

@Converter(autoApply = true)
public class StatoConverter implements AttributeConverter<Stato, Object> {

    @Override
    public Object convertToDatabaseColumn(Stato attribute) {
        if (attribute == null) return null;
        
        try {
            PGobject pgObject = new PGobject();
            pgObject.setType("stato");
            pgObject.setValue(attribute.name());
            return pgObject;
        } catch (SQLException e) {
            throw new RuntimeException("Errore conversione Stato", e);
        }
    }

    @Override
    public Stato convertToEntityAttribute(Object dbData) {
        if (dbData == null) return null;
        
        String value;
        if (dbData instanceof PGobject) {
            value = ((PGobject) dbData).getValue();
        } else {
            value = dbData.toString();
        }
        
        return Stato.valueOf(value);
    }
}