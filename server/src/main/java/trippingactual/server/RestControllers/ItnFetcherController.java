package trippingactual.server.RestControllers;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.json.Json;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObject;
import trippingactual.server.models.ItineraryObject;
import trippingactual.server.models.TripInfo;
import trippingactual.server.services.ItineraryBuilder;

@RestController
@RequestMapping("/api/itnry")
public class ItnFetcherController {

    @Autowired
    private ItineraryBuilder itnServ;

    @GetMapping("/itnrys-fromtrip")
    public ResponseEntity<String> getItinerariesFromTripId(
            @RequestHeader("Authorization") String firebaseUid,
            @RequestParam("trip_id") String trip_id) {

        if (firebaseUid.isEmpty()) {
            JsonObject replyForUnAuthorized = Json.createObjectBuilder()
                    .add("response", "Unauthorized")
                    .build();
            return ResponseEntity.status(401).body(replyForUnAuthorized.toString());
        }

        List<ItineraryObject> fromRepo = itnServ.getItnryFromTripId(trip_id);

   
    if (!fromRepo.isEmpty()) {
            JsonArrayBuilder jsonArrayBuilder = Json.createArrayBuilder();

            for (ItineraryObject itn : fromRepo) {
                JsonObject toReturnJson = Json.createObjectBuilder()
                        .add("itinerary_id", itn.getItinerary_id())
                        .add("trip_id", itn.getTrip_id()) // Assuming the FileObject has resourceId
                        .add("itn_date", TripInfo.dateUtilToString(itn.getItn_date()))
                        .build();
                jsonArrayBuilder.add(toReturnJson);
            }

                return ResponseEntity.ok().body(jsonArrayBuilder.build().toString());
    } else {

        JsonObject replyForError = Json.createObjectBuilder()
        .add("response", "No itineraries found")
        .build();
return ResponseEntity.status(204).body(replyForError.toString());
    }

}

}
