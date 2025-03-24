package trippingactual.server.RestControllers;


import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObject;
import trippingactual.server.models.LocationObject;
import trippingactual.server.services.LocationService;

@RestController
@RequestMapping("/api/locations")
@CrossOrigin(origins = "http://*",  // Allowed origin
allowCredentials = "false"  // No need to allow credentials for Authorization header)
)
public class LocationObjRestController {

    @Autowired
    private LocationService locationSvc;

    @GetMapping(path = "/get-location", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getLocationObjByLocationId(
        @RequestHeader("Authorization") String firebaseUid,
        @RequestParam("location_id") String location_id
    ){
        
    if (firebaseUid.isEmpty()) {
            JsonObject replyForUnAuthorized = Json.createObjectBuilder()
                    .add("response", "Unauthorized")
                    .build();
            return ResponseEntity.status(401).body(replyForUnAuthorized.toString());
        }

        Optional<LocationObject> location = locationSvc.getLocatbjectByLocationId(location_id);
        
        if(!location.isEmpty()){
            LocationObject locationhave = location.get();

            JsonObject locationInJson = locationhave.toJson();

            return ResponseEntity.ok().body(locationInJson.toString());


        } else{
            JsonObject replyForError = Json.createObjectBuilder()
            .add("response", "Error: No location found")
            .build();

            return ResponseEntity.status(505).body(replyForError.toString());
        }

    }

    @GetMapping(path = "/get-all-locations", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getAllLocationsByTripId(
        @RequestHeader("Authorization") String firebaseUid,
        @RequestParam("trip_id") String trip_id)
    {

        if (firebaseUid.isEmpty()) {
            JsonObject replyForUnAuthorized = Json.createObjectBuilder()
                    .add("response", "Unauthorized")
                    .build();
            return ResponseEntity.status(401).body(replyForUnAuthorized.toString());
        }

        List<LocationObject> fromRepo = locationSvc.getManyLocationsByTripId(trip_id);
        
        if(!fromRepo.isEmpty()){
            JsonArrayBuilder buildArray = Json.createArrayBuilder();

            for(LocationObject local : fromRepo){
                JsonObject temp = local.toJson();
                buildArray.add(temp);
            }

            return ResponseEntity.ok().body(buildArray.build().toString());
        } else {
            JsonObject replyForError = Json.createObjectBuilder()
            .add("response", "No locations found")
            .build();
    return ResponseEntity.status(204).body(replyForError.toString());
        }

    }
    
}
