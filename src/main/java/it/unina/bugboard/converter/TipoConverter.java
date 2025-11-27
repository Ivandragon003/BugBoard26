package it.unina.bugboard.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import it.unina.bugboard.model.Tipo;
import org.postgresql.util.PGobject;
import java.sql.SQLException;

@Converter(autoApply = true)
public class TipoConverter implements AttributeConverter<Tipo, Object> {

    @Override
    public Object convertToDatabaseColumn(Tipo attribute) {
        if (attribute == null) return null;
        
        try {
            PGobject pgObject = new PGobject();
            pgObject.setType("tipo");
            pgObject.setValue(attribute.name());
            return pgObject;
        } catch (SQLException e) {
            throw new RuntimeException("Errore conversione Tipo", e);
        }
    }

    @Override
    public Tipo convertToEntityAttribute(Object dbData) {
        if (dbData == null) return null;
        
        String value;
        if (dbData instanceof PGobject) {
            value = ((PGobject) dbData).getValue();
        } else {
            value = dbData.toString();
        }
        
        return Tipo.valueOf(value);
    }
}
