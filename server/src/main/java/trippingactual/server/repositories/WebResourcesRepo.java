package trippingactual.server.repositories;

import java.util.List;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class WebResourcesRepo {

    @Autowired
    private MongoTemplate mongoTemplate;


    public List<Document> getCountriesDataList(){
        
        return mongoTemplate.findAll(Document.class, "country_summary");
    }
    
}
