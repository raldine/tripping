package trippingactual.server.RestControllers;

import java.io.IOException;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import io.micrometer.core.annotation.Timed;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.json.Json;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObject;
import trippingactual.server.models.FileObject;
import trippingactual.server.models.LocationObject;
import trippingactual.server.models.TripInfo;

import trippingactual.server.services.FileManagingServiceSql;
import trippingactual.server.services.FileUploadService;
import trippingactual.server.services.TripService;

@RestController
@RequestMapping("/trip")
@CrossOrigin(origins = "http://*",  // Allowed origin
allowCredentials = "false"  // No need to allow credentials for Authorization header)
)
public class TripEditingRestController {

    @Autowired
    private TripService tripService;

    @Autowired
    private FileUploadService fileUploadService;

    @Autowired
    private FileManagingServiceSql sqlFileService;


    @Autowired
    private MeterRegistry meterRegistry;


    @PutMapping(path = "/newtrip", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> putNewTrip(
            @RequestHeader("Authorization") String firebaseUUID,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart(value = "trip_id") String trip_id,
            @RequestPart(value = "trip_name") String trip_name,
            @RequestPart(value = "start_date") String start_date,
            @RequestPart(value = "end_date") String end_date,
            @RequestPart(value = "destination_city") String destination_city,
            @RequestPart(value = "destination_curr", required = false) Optional<String> destination_curr,
            @RequestPart(value = "destination_timezone", required = false) Optional<String> destination_timezone,
            @RequestPart(value = "d_timezone_name", required = false) Optional<String> d_timezone_name,
            @RequestPart(value = "d_iso2", required = false) Optional<String> d_iso2,
            @RequestPart(value = "dest_lat", required = false) Optional<String> dest_lat,
            @RequestPart(value = "dest_lng", required = false) Optional<String> dest_lng,
            @RequestPart(value = "description_t", required = false) Optional<String> description_t,
            @RequestPart(value = "cover_image_id", required = false) Optional<String> cover_image_id,
            @RequestPart(value = "attendees") String attendees,
            @RequestPart(value = "master_user_id") String master_user_id,
            @RequestPart(value = "comments") String comments,
            @RequestPart(value = "m_user_display_name") String m_user_display_name,
            @RequestPart(value = "m_user_email") String m_user_email,
            @RequestPart(value = "original_file_name", required = false) Optional<String> original_file_name,
            @RequestPart(value = "photourl", required = false) Optional<String> pexel_photourl,
            @RequestPart(value = "media_type", required = false) Optional<String> pexel_media_type) {

        if (firebaseUUID.isEmpty()) {
            JsonObject replyForUnAuthorized = Json.createObjectBuilder()
                    .add("response", "Unauthorized")
                    .build();
            return ResponseEntity.status(401).body(replyForUnAuthorized.toString());

        } else {

            // check if values are there or not
            // Extract values safely (use defaults if not present)
            String finalDestinationCurr = destination_curr.orElse("N/A");
            String finalDestinationTimezone = destination_timezone.orElse("N/A");
            String finalDTimezoneName = d_timezone_name.orElse("N/A");
            String finalDest_lat = dest_lat.orElse("N/A");
            String finalDest_lng = dest_lng.orElse("N/A");
            String finalD_iso2 = d_iso2.orElse("N/A");
            String finalDescriptionT = description_t.orElse("No description provided");
            String finalCoverImageId = cover_image_id.orElse("N/A");
            String finalOriginalFileName = original_file_name.orElse("unknownfilename");
            String finalPexelPhotoUrl = pexel_photourl.orElse("No image available");
            String finalPexelMediaType = pexel_media_type.orElse("unknown");

            // build basic tripInfoObject
            TripInfo tripBuilding = new TripInfo();
            tripBuilding.setTrip_id(trip_id);
            tripBuilding.setTrip_name(trip_name);
            tripBuilding.setStart_date(TripInfo.parseDate(start_date));
            tripBuilding.setEnd_date(TripInfo.parseDate(end_date));
            tripBuilding.setDestination_city(destination_city);
            tripBuilding.setAttendees(attendees);
            tripBuilding.setMaster_user_id(master_user_id);
            tripBuilding.setDestination_curr(finalDestinationCurr);
            tripBuilding.setDestination_timezone(finalDestinationTimezone);
            tripBuilding.setD_timezone_name(finalDTimezoneName);
            tripBuilding.setD_iso2(finalD_iso2);
            tripBuilding.setDest_lat(finalDest_lat);
            tripBuilding.setDest_lng(finalDest_lng);
            tripBuilding.setDescription_t(finalDescriptionT);

            // Handle Optional File Upload
            if (file != null && !file.isEmpty()) {
                System.out.println("File received: " + file.getOriginalFilename());

                // set new resource id
                String resourceId = fileUploadService.resourceIdGenerator(comments);
                FileObject coverImageUserUploaded = new FileObject();
                coverImageUserUploaded.setResourceId(resourceId);
                coverImageUserUploaded.setTrip_id(trip_id);
                coverImageUserUploaded.setAccommodation_id("N/A");
                coverImageUserUploaded.setActivity_id("N/A");
                coverImageUserUploaded.setFlight_id("N/A");
                coverImageUserUploaded.setUser_id_pp("N/A");
                String formattedOriName = finalOriginalFileName.replace(" ", "_");
                String shortenIfTooLong = "";
                if (formattedOriName.length() > 99) {
                    shortenIfTooLong = formattedOriName.substring(0, 98);
                } else {
                    shortenIfTooLong = formattedOriName;
                }
                coverImageUserUploaded.setOriginal_file_name(shortenIfTooLong);
                FileObject finalFileObjectSuccessToDO = fileUploadService.uploadFile(file, comments, resourceId,
                        coverImageUserUploaded);
                System.out.println("uploaded user uploaded cover iamge to DO, now inserting to sql");
                FileObject finalFileSuccessSQL;
                try {
                    finalFileSuccessSQL = sqlFileService.upload(finalFileObjectSuccessToDO);
                    if (finalFileSuccessSQL != null) {

                        tripBuilding.setCover_image_id(finalFileSuccessSQL.getResourceId());

                    }
                } catch (IOException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                } catch (SQLException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                }

            } else {
                // cover image is autogenerated by pexel
                // to insert pexel photo in resources table
                String resourceId = fileUploadService.resourceIdGenerator(comments);
                // Create a new FileObject to store the details
                FileObject newResource = new FileObject();
                newResource.setResourceId(resourceId);

                // Tie the resource to the trip and other components
                newResource.setTrip_id(trip_id);
                newResource.setDo_src_link(finalPexelPhotoUrl);
                newResource.setMedia_type(finalPexelMediaType);
                newResource.setOriginal_file_name(resourceId + "_cover_image");
                newResource.setAccommodation_id("N/A");
                newResource.setActivity_id("N/A");
                newResource.setFlight_id("N/A");
                newResource.setUser_id_pp("N/A");

                // Upload the file to the database
                FileObject finalFileSuccessSQL;
                try {
                    finalFileSuccessSQL = sqlFileService.upload(newResource);
                    if (finalFileSuccessSQL != null) {
                        tripBuilding.setCover_image_id(finalFileSuccessSQL.getResourceId());
                    }
                } catch (IOException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                } catch (SQLException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                }

            }

            String replyFromRepo = tripService.putNewTrip(tripBuilding, m_user_display_name, m_user_email);

            if (replyFromRepo != null && replyFromRepo.equals("OK")) {

                meterRegistry.counter("myapp_tripping_trips_created_total").increment(); // Increment counter
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


    @GetMapping(path = "/get-trips/{firebaseuid}")
    public ResponseEntity<String> getAllTripsByUSerId(
        @RequestHeader("Authorization") String firebaseUid,
        @PathVariable("firebaseuid") String firebaseUidd
    ){

        if (firebaseUid.isEmpty()) {
            JsonObject replyForUnAuthorized = Json.createObjectBuilder()
                    .add("response", "Unauthorized")
                    .build();
            return ResponseEntity.status(401).body(replyForUnAuthorized.toString());
        }


        List<TripInfo> tripsBelongingtoUser = tripService.getAllTripsByUserId(firebaseUidd);

 if (!tripsBelongingtoUser.isEmpty()) {
        JsonArrayBuilder jsonArrayBuilder = Json.createArrayBuilder();

        // Convert each UserInfo object to JSON and add it to the array
        for (TripInfo trip : tripsBelongingtoUser) {
            JsonObject toReturnJson = trip.toJson();
            jsonArrayBuilder.add(toReturnJson);
        }

        return ResponseEntity.status(200).body(jsonArrayBuilder.build().toString());
    } else {
        JsonObject replyForError = Json.createObjectBuilder()
                .add("response", "No trips found")
                .build();
        return ResponseEntity.status(204).body(replyForError.toString());
    }

    }



    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteTripBytripId(
        @RequestHeader("Authorization") String firebaseUid,
        @RequestParam("trip_id") String trip_id
    ){
        if (firebaseUid.isEmpty()) {
            JsonObject replyForUnAuthorized = Json.createObjectBuilder()
                    .add("response", "Unauthorized")
                    .build();
            return ResponseEntity.status(401).body(replyForUnAuthorized.toString());
        }


        String replyFromRepo = tripService.deleteTripByTripId(trip_id);

        if(!replyFromRepo.equals("Error")){
            JsonObject respondSuccessDelete = Json.createObjectBuilder()
                                    .add("deleted_id", trip_id)
                                    .build();

            return ResponseEntity.status(202).body(respondSuccessDelete.toString());
        } else {
            JsonObject replyForError = Json.createObjectBuilder()
            .add("response", "No trip deleted")
            .build();
    return ResponseEntity.status(204).body(replyForError.toString());
        }


    }

    @GetMapping(path = "/get-trip", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getLocationObjByLocationId(
        @RequestHeader("Authorization") String firebaseUid,
        @RequestParam("trip_id") String trip_id
    ){
        
    if (firebaseUid.isEmpty()) {
            JsonObject replyForUnAuthorized = Json.createObjectBuilder()
                    .add("response", "Unauthorized")
                    .build();
            return ResponseEntity.status(401).body(replyForUnAuthorized.toString());
        }

        Optional<TripInfo> tripById = tripService.getTripDetailsByTripId(trip_id);
        
        if(!tripById.isEmpty()){
            TripInfo tripgotten = tripById.get();

            JsonObject tripInJson = tripgotten.toJson();

            return ResponseEntity.ok().body(tripInJson.toString());


        } else{
            JsonObject replyForError = Json.createObjectBuilder()
            .add("response", "Error: No trip found")
            .build();

            return ResponseEntity.status(505).body(replyForError.toString());
        }

    }

}
