package trippingactual.server.RestControllers;

import java.io.StringReader;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;

import jakarta.json.Json;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import trippingactual.server.models.ActivityObj;
import trippingactual.server.models.LocationObject;
import trippingactual.server.models.TripInfo;
import trippingactual.server.models.UserRoles;
import trippingactual.server.services.ActivityService;

@RestController
@RequestMapping("/api/activities")
@CrossOrigin(origins = "http://*", // Allowed origin
        allowCredentials = "false" // No need to allow credentials for Authorization header)
)
public class ActivityRestController {

    @Autowired
    private ActivityService activityService;

    @GetMapping(path = "/get-all-activities", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getAllActivitiesByTripId(
            @RequestHeader("Authorization") String firebaseUid,
            @RequestParam("trip_id") String trip_id) {

        if (firebaseUid.isEmpty()) {
            JsonObject replyForUnAuthorized = Json.createObjectBuilder()
                    .add("response", "Unauthorized")
                    .build();
            return ResponseEntity.status(401).body(replyForUnAuthorized.toString());
        }

        List<ActivityObj> fromRepo = activityService.getAllActivitiesByTripId(trip_id);

        if (!fromRepo.isEmpty()) {
            JsonArrayBuilder buildArray = Json.createArrayBuilder();

            for (ActivityObj acti : fromRepo) {
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

    @PutMapping(path = "/addnewActi", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> addNewActivity(
            @RequestHeader("Authorization") String firebaseUUID,
            @RequestPart(value = "activity_id") String activity_id,
            @RequestPart(value = "trip_id") String trip_id,
            @RequestPart(value = "itinerary_id") String itinerary_id,
            @RequestPart(value = "event_name") String event_name,
            @RequestPart(value = "activity_type") String activity_type,
            @RequestPart(value = "start_date") String start_date,
            @RequestPart(value = "end_date") String end_date,
            @RequestPart(value = "start_time") String start_time,
            @RequestPart(value = "end_time") String end_time,
            @RequestPart(value = "timezone_time", required = false) Optional<String> timezone_time,
            @RequestPart(value = "event_notes", required = false) Optional<String> event_notes,
            @RequestPart(value = "location_id") String location_id,
            @RequestPart(value = "location_lat", required = false) Optional<String> location_lat,
            @RequestPart(value = "location_lng", required = false) Optional<String> location_lng,
            @RequestPart(value = "location_address") String location_address,
            @RequestPart(value = "location_name", required = false) Optional<String> location_name,
            @RequestPart(value = "google_place_id", required = false) Optional<String> google_place_id,
            @RequestPart(value = "g_biz_number", required = false) Optional<String> g_biz_number,
            @RequestPart(value = "g_biz_website", required = false) Optional<String> g_biz_website,
            @RequestPart(value = "g_opening_hrs", required = false) Optional<String> g_opening_hrs) {

        if (firebaseUUID.isEmpty()) {
            JsonObject replyForUnAuthorized = Json.createObjectBuilder()
                    .add("response", "Unauthorized")
                    .build();
            return ResponseEntity.status(401).body(replyForUnAuthorized.toString());

        } else {

            // check if values are there or not
            // Extract values safely (use defaults if not present)
            String final_timezone_time = timezone_time.orElse("N/A");
            String final_event_notes = event_notes.orElse("N/A");
            String final_location_lng = location_lng.orElse("N/A");
            String final_location_lat = location_lat.orElse("N/A");
            String final_location_name = location_name.orElse("N/A");
            String final_google_place_id = google_place_id.orElse("N/A");
            String final_g_biz_number = g_biz_number.orElse("N/A");
            String final_g_biz_website = g_biz_website.orElse("N/A");

            String final_g_opening_hrs = g_opening_hrs.orElse("N/A");
            String[] openingHoursArray = final_g_opening_hrs.split(",");

            ActivityObj newActivity = new ActivityObj();
            newActivity.setActivity_id(activity_id);
            newActivity.setTrip_id(trip_id);
            newActivity.setItinerary_id(itinerary_id);
            newActivity.setEvent_name(event_name);
            newActivity.setActivity_type(activity_type);
            newActivity.setStart_date(TripInfo.parseDate(start_date));
            newActivity.setEnd_date(TripInfo.parseDate(end_date));
            newActivity.setStart_time(start_time);
            newActivity.setEnd_time(end_time);
            newActivity.setTimezone_time(final_timezone_time);
            newActivity.setEvent_notes(final_event_notes);
            newActivity.setLocation_id(location_id);
            newActivity.setLast_updated_by(firebaseUUID);

            System.out.println("received ACTIVITY info is " + newActivity.toString());

            LocationObject newLocationOfActivity = new LocationObject();
            newLocationOfActivity.setLocation_id(location_id);
            newLocationOfActivity.setLocation_lat(final_location_lat);
            newLocationOfActivity.setLocation_lng(final_location_lng);
            newLocationOfActivity.setLocation_name(final_location_name);
            newLocationOfActivity.setLocation_address(location_address);
            newLocationOfActivity.setGoogle_place_id(final_google_place_id);
            newLocationOfActivity.setG_biz_number(final_g_biz_number);
            newLocationOfActivity.setG_biz_website(final_g_biz_website);
            newLocationOfActivity.setG_opening_hrs(openingHoursArray);
            newLocationOfActivity.setTrip_id(trip_id);
            newLocationOfActivity.setItinerary_id(itinerary_id);

            String replyFromRepo = activityService.insertNewActivityInTable(newActivity, newLocationOfActivity);

            if (!replyFromRepo.equals("failed")) {
                JsonObject replyToAngular = Json.createObjectBuilder()
                        .add("response", "Registered new activity")
                        .build();
                return ResponseEntity.ok().body(replyToAngular.toString());

            } else {
                JsonObject replyToAngular = Json.createObjectBuilder()
                        .add("response", "Error registering activity")
                        .build();
                return ResponseEntity.internalServerError().body(replyToAngular.toString());
            }
        }

    }

@DeleteMapping("/delete")
    public ResponseEntity<String> deleteActivityById(
        @RequestHeader("Authorization") String firebaseUid,
        @RequestParam("activity_id") String activity_id
    ){
        if (firebaseUid.isEmpty()) {
            JsonObject replyForUnAuthorized = Json.createObjectBuilder()
                    .add("response", "Unauthorized")
                    .build();
            return ResponseEntity.status(401).body(replyForUnAuthorized.toString());
        }


        String replyFromRepo = activityService.deleteActivityByActivityid(activity_id);

        if(!replyFromRepo.equals("Error")){
            JsonObject respondSuccessDelete = Json.createObjectBuilder()
                                    .add("deleted_id", activity_id)
                                    .build();

            return ResponseEntity.status(202).body(respondSuccessDelete.toString());
        } else {
            JsonObject replyForError = Json.createObjectBuilder()
            .add("response", "No activity deleted")
            .build();
    return ResponseEntity.status(204).body(replyForError.toString());
        }


    }





}
