package trippingactual.server.services;

import java.util.Date;
import java.util.List;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import trippingactual.server.models.CountryInfo;
import trippingactual.server.repositories.WebResourcesRepo;

@Service
public class WebResourcesService {

    @Autowired
    private WebResourcesRepo webResourcesRepo;

    public JsonArray getAllCountriesInfo(){

        JsonArrayBuilder finalPayloadBuilder = Json.createArrayBuilder();

        List<Document> fromRepo = webResourcesRepo.getCountriesDataList();

        if(fromRepo.size()!=0){

            for(Document oneCountry :  fromRepo){
                JsonObject oneCountryToJson = bsonToJsonObject(oneCountry);
                finalPayloadBuilder.add(oneCountryToJson);
            }
     
        
    }


    return finalPayloadBuilder.build();

}
    

    public static JsonObject bsonToJsonObject(Document doc) {
        JsonObjectBuilder builder = Json.createObjectBuilder();

        doc.forEach((key, value) -> {
            if (value instanceof Document) {
                builder.add(key, bsonToJsonObject((Document) value)); // Recursive for nested objects
            } else if (value instanceof List) {
                builder.add(key, bsonArrayToJsonArray((List<?>) value)); // Convert BSON array
            } else if (value instanceof ObjectId) {
                builder.add(key, value.toString()); // Convert ObjectId to string
            } else if (value instanceof Integer) {
                builder.add(key, (Integer) value);
            } else if (value instanceof Boolean) {
                builder.add(key, (Boolean) value);
            } else {
                builder.add(key, value.toString()); // Convert other types to string
            }
        });

        return builder.build();
    }

    public static JsonArray bsonArrayToJsonArray(List<?> list) {
        JsonArrayBuilder arrayBuilder = Json.createArrayBuilder();

        for (Object value : list) {
            if (value instanceof Document) {
                arrayBuilder.add(bsonToJsonObject((Document) value)); // Handle nested BSON object
            } else if (value instanceof List) {
                arrayBuilder.add(bsonArrayToJsonArray((List<?>) value)); // Handle nested arrays
            } else if (value instanceof ObjectId) {
                arrayBuilder.add(value.toString()); // Convert ObjectId to String
            } else if (value instanceof Integer) {
                arrayBuilder.add((Integer) value);
            } else if (value instanceof Boolean) {
                arrayBuilder.add((Boolean) value);
            } else if (value instanceof Double) {
                arrayBuilder.add((Double) value);
            } else if (value instanceof Long) {
                arrayBuilder.add((Long) value);
            } else if (value instanceof Date) {
                arrayBuilder.add(((Date) value).toInstant().toString()); // Convert Date to ISO format
            } else if (value == null) {
                arrayBuilder.addNull(); // Handle null values properly
            } else {
                arrayBuilder.add(value.toString()); // Convert everything else to String
            }
        }
        return arrayBuilder.build();
    }
    
}
