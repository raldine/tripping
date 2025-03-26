package trippingactual.server.RestControllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.json.JsonArray;
import trippingactual.server.services.WebResourcesService;


@RestController
@RequestMapping("/api/getCountryData")
@CrossOrigin(origins = "https://tripping-app.com/", // Allowed origin
        allowCredentials = "false" // No need to allow credentials for Authorization header)
) // Allowed origin
public class WebResourcesController {


    @Autowired
    private WebResourcesService webResourcesService;

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getCountriesData(){

        JsonArray toSend = webResourcesService.getAllCountriesInfo();

        

        if(toSend.size()!=0){
            for(int i = 0; i < 3; i++){
                System.out.println("check if countries correctly loaded: " + toSend.getJsonObject(i).toString());
            }
            return ResponseEntity.ok().body(toSend.toString());
        } else {
            return ResponseEntity.internalServerError().body("Error sending countries data");
        }

    }

    
}
