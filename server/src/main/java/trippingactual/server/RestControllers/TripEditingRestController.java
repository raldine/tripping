package trippingactual.server.RestControllers;

import java.io.StringReader;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import trippingactual.server.services.TripService;

@RestController
@RequestMapping("/trip")
@CrossOrigin("http://localhost:4200")
public class TripEditingRestController {

    @Autowired
    private TripService tripService;


    @PutMapping("/newtrip")
    public ResponseEntity<String> putNewTrip(
        @RequestHeader("Authorization") String firebaseUUID,
        @RequestBody String payload
    ){

        if(firebaseUUID.isEmpty()){
            JsonObject replyForUnAuthorized = Json.createObjectBuilder()
                                            .add("response", "Unauthorized")
                                            .build();
            return ResponseEntity.status(401).body(replyForUnAuthorized.toString());

        } else {

            JsonObject tripInfoJson = Json.createReader(new StringReader(payload))
                                        .readObject();

            String trip_id = tripInfoJson.getString("trip_id");

            String replyFromRepo = tripService.putNewTrip(tripInfoJson);

            if(replyFromRepo!=null && replyFromRepo.equals("OK")){
                JsonObject replyForSuccess = Json.createObjectBuilder()
                                            .add("response", trip_id)
                                            .build();

                return ResponseEntity.status(201).body(replyForSuccess.toString());
            }
            
            JsonObject replyForServerError = Json.createObjectBuilder()
                                            .add("response", "Server Internal Error")
                                            .build();
            return ResponseEntity.status(501).body(replyForServerError.toString());
        }
        

    }
    
}
