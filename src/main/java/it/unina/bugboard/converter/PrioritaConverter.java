package it.unina.bugboard.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import it.unina.bugboard.model.Priorita;
import org.postgresql.util.PGobject;
import java.sql.SQLException;

@Converter(autoApply = true)
public class PrioritaConverter implements AttributeConverter<Priorita, Object> {

    @Override
    public Object convertToDatabaseColumn(Priorita attribute) {
        System.out.println("=== CONVERTING TO DB ===");
        System.out.println("Input attribute: " + attribute);
        
        if (attribute == null) {
            System.out.println("Attribute is null, returning null");
            return null;
        }
        
        try {
            PGobject pgObject = new PGobject();
            pgObject.setType("priorita");
            pgObject.setValue(attribute.name());
            
            System.out.println("Created PGobject:");
            System.out.println("  Type: " + pgObject.getType());
            System.out.println("  Value: " + pgObject.getValue());
            
            return pgObject;
        } catch (SQLException e) {
            System.err.println("ERROR in converter: " + e.getMessage());
            throw new RuntimeException("Errore conversione Priorita", e);
        }
    }

    @Override
    public Priorita convertToEntityAttribute(Object dbData) {
        System.out.println("=== CONVERTING FROM DB ===");
        System.out.println("Input dbData: " + dbData);
        System.out.println("Input dbData class: " + (dbData != null ? dbData.getClass().getName() : "null"));
        
        if (dbData == null) {
            return null;
        }
        
        String value;
        if (dbData instanceof PGobject) {
            value = ((PGobject) dbData).getValue();
            System.out.println("Extracted value from PGobject: " + value);
        } else {
            value = dbData.toString();
            System.out.println("Converted to string: " + value);
        }
        
        Priorita result = Priorita.valueOf(value);
        System.out.println("Final enum: " + result);
        return result;
    }
}