package trippingactual.server.RestControllers;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;

import jakarta.json.Json;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObject;

import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;

import trippingactual.server.models.AccommObject;
import trippingactual.server.models.ActivityObj;
import trippingactual.server.models.LocationObject;
import trippingactual.server.models.TripInfo;
import trippingactual.server.services.AccommodationService;
import trippingactual.server.services.ItineraryBuilder;
import trippingactual.server.utils.TimeManipulator;

@RestController
@RequestMapping("/api/accomm")
@CrossOrigin(origins = "http://*", // Allowed origin
        allowCredentials = "false" // No need to allow credentials for Authorization header)
) // Allowed origin
public class AccommodationRestController {

    @Autowired
    private ItineraryBuilder itnService;

    @Autowired
    private AccommodationService accommSvc;

    @PutMapping(path = "/newaccomm", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> putNewAccomm(
            @RequestHeader("Authorization") String firebaseUUID,
            @RequestPart(value = "accommodation_id") String accommodation_id,
            @RequestPart(value = "accommodation_name") String accommodation_name,
            @RequestPart(value = "trip_id") String trip_id,
            @RequestPart(value = "check_in_date") String check_in_date,
            @RequestPart(value = "check_in_time") String check_in_time,
            @RequestPart(value = "check_out_date") String check_out_date,
            @RequestPart(value = "check_out_time") String check_out_time,
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

            AccommObject newAccomm = new AccommObject();
            newAccomm.setAccommodation_id(accommodation_id);
            newAccomm.setAccommodation_name(accommodation_name);
            newAccomm.setTrip_id(trip_id);
            newAccomm.setCheck_in_date(TripInfo.parseDate(check_in_date));
            newAccomm.setCheck_in_time(check_in_time);
            newAccomm.setCheck_out_date(TripInfo.parseDate(check_out_date));
            newAccomm.setCheck_out_time(check_out_time);
            newAccomm.setTimezone_time(final_timezone_time);
            newAccomm.setEvent_notes(final_event_notes);
            newAccomm.setLocation_id(location_id);
            newAccomm.setLast_updated_by(firebaseUUID);

            // set LocationObj
            LocationObject newLocationOfAccomm = new LocationObject();
            newLocationOfAccomm.setLocation_id(location_id);
            newLocationOfAccomm.setLocation_lat(final_location_lat);
            newLocationOfAccomm.setLocation_lng(final_location_lng);
            newLocationOfAccomm.setLocation_name(final_location_name);
            newLocationOfAccomm.setLocation_address(location_address);
            newLocationOfAccomm.setGoogle_place_id(final_google_place_id);
            newLocationOfAccomm.setG_biz_number(final_g_biz_number);
            newLocationOfAccomm.setG_biz_website(final_g_biz_website);
            newLocationOfAccomm.setG_opening_hrs(openingHoursArray);
            newLocationOfAccomm.setTrip_id(trip_id);
            newLocationOfAccomm.setItinerary_id(itnService.getItnryIdByTripIdAndDate(trip_id, check_in_date));

            String activityidForCheckIn = "act" + UUID.randomUUID().toString().replaceAll("-", "").substring(0, 24);
            String activityIdForCheckOut = "act" + UUID.randomUUID().toString().replaceAll("-", "").substring(0, 24);
            // set check In and check out activity for accommodation
            ActivityObj checkInAcc = new ActivityObj();
            checkInAcc.setActivity_id(activityidForCheckIn);
            checkInAcc.setTrip_id(trip_id);
            checkInAcc.setItinerary_id(itnService.getItnryIdByTripIdAndDate(trip_id, check_in_date));
            checkInAcc.setEvent_name("Check into " + accommodation_name);
            checkInAcc.setActivity_type("Check In - Accomm");
            checkInAcc.setStart_date(TripInfo.parseDate(check_in_date));
            checkInAcc.setStart_time(check_in_time);
            checkInAcc.setEnd_date(TripInfo.parseDate(check_in_date));
            checkInAcc.setEnd_time(TimeManipulator.addMinutesToTimeString(check_in_time, 30));
            checkInAcc.setTimezone_time(final_timezone_time);
            checkInAcc.setEvent_notes("(Auto-generated check in activity)");
            checkInAcc.setLocation_id(location_id);
            checkInAcc.setLast_updated_by(firebaseUUID);
            // checkout
            ActivityObj checkOutAcc = new ActivityObj();
            checkOutAcc.setActivity_id(activityIdForCheckOut);
            checkOutAcc.setTrip_id(trip_id);
            checkOutAcc.setItinerary_id(itnService.getItnryIdByTripIdAndDate(trip_id, check_out_date));
            checkOutAcc.setEvent_name("Check out of " + accommodation_name);
            checkOutAcc.setActivity_type("Check Out - Accomm");
            checkOutAcc.setStart_date(TripInfo.parseDate(check_out_date));
            checkOutAcc.setStart_time(check_out_time);
            checkOutAcc.setEnd_date(TripInfo.parseDate(check_out_date));
            checkOutAcc.setEnd_time(TimeManipulator.addMinutesToTimeString(check_out_time, 30));
            checkOutAcc.setTimezone_time(final_timezone_time);
            checkOutAcc.setEvent_notes(
                    "(Auto-generated check out activity) Remember to check out by " + check_out_time + ".");
            checkOutAcc.setLocation_id(location_id);
            checkOutAcc.setLast_updated_by(firebaseUUID);

            String reply = accommSvc.putNewAccommodation(newAccomm, newLocationOfAccomm, checkInAcc, checkOutAcc);

            if (reply.equals("OK")) {

                Optional<AccommObject> retrieved = accommSvc.getAccommObjectByAccId(accommodation_id);
                AccommObject finalone = retrieved.get();
                JsonObject accommJsonObject = finalone.toJson();
                JsonObject replyForSuccess = Json.createObjectBuilder()
                        .add("response", accommJsonObject)
                        .build();
                return ResponseEntity.ok().body(replyForSuccess.toString());
            } else {

                JsonObject replyFail = Json.createObjectBuilder()
                        .add("error", "Could not add accommodation.")
                        .build();
                return ResponseEntity.internalServerError().body(replyFail.toString());
            }

        }

    }

    @GetMapping(path = "/get-accomms")
    public ResponseEntity<String> getAllAccommsFromTripId(
            @RequestHeader("Authorization") String firebaseUid,
            @RequestParam("trip_id") String trip_id) {
        if (firebaseUid.isEmpty()) {
            JsonObject replyForUnAuthorized = Json.createObjectBuilder()
                    .add("response", "Unauthorized")
                    .build();
            return ResponseEntity.status(401).body(replyForUnAuthorized.toString());
        }

        List<AccommObject> accommosBelongingToTrip = accommSvc.getManyAccommByTripId(trip_id);

        if (!accommosBelongingToTrip.isEmpty()) {
            JsonArrayBuilder jsonArrayBuilder = Json.createArrayBuilder();

            // Convert each UserInfo object to JSON and add it to the array
            for (AccommObject accomm : accommosBelongingToTrip) {
                JsonObject toReturnJson = accomm.toJson();
                jsonArrayBuilder.add(toReturnJson);
            }

            return ResponseEntity.status(200).body(jsonArrayBuilder.build().toString());
        } else {
            JsonObject replyForError = Json.createObjectBuilder()
                    .add("response", "No accommodations found")
                    .build();
            return ResponseEntity.status(204).body(replyForError.toString());
        }

    }

}
