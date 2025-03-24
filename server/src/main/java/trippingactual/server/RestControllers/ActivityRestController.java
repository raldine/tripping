package trippingactual.server.RestControllers;

import java.util.List;

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
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObject;
import trippingactual.server.models.ActivityObj;
import trippingactual.server.models.LocationObject;
import trippingactual.server.services.ActivityService;

@RestController
@RequestMapping("/api/activities")
@CrossOrigin(origins = "http://*",  // Allowed origin
allowCredentials = "false"  // No need to allow credentials for Authorization header)
)
public class ActivityRestController {

    @Autowired
    private ActivityService activityService;

     @GetMapping(path = "/get-all-activities", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getAllActivitiesByTripId(
        @RequestHeader("Authorization") String firebaseUid,
        @RequestParam("trip_id") String trip_id)
    {

        if (firebaseUid.isEmpty()) {
            JsonObject replyForUnAuthorized = Json.createObjectBuilder()
                    .add("response", "Unauthorized")
                    .build();
            return ResponseEntity.status(401).body(replyForUnAuthorized.toString());
        }

        List<ActivityObj> fromRepo = activityService.getAllActivitiesByTripId(trip_id);
        
        if(!fromRepo.isEmpty()){
            JsonArrayBuilder buildArray = Json.createArrayBuilder();

            for(ActivityObj acti : fromRepo){
                JsonObject temp = acti.toJson();
                buildArray.add(temp);
            }

            return ResponseEntity.ok().body(buildArray.build().toString());
        } else {
            JsonObject replyForError = Json.createObjectBuilder()
            .add("response", "No activites found")
            .build();
    return ResponseEntity.status(204).body(replyForError.toString());
        }

    }
    
}
