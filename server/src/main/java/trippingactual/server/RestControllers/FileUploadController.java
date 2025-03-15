package trippingactual.server.RestControllers;

import java.io.IOException;
import java.io.StringReader;
import java.lang.module.ResolutionException;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.json.Json;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObject;
import trippingactual.server.models.FileObject;
import trippingactual.server.services.FileManagingServiceSql;
import trippingactual.server.services.FileUploadService;

@RestController
@RequestMapping
@CrossOrigin("http://localhost:4200")
public class FileUploadController {

    @Autowired
    private FileUploadService allfilesserve;

    @Autowired
    private FileManagingServiceSql fileServiceSql;

    @PostMapping(path = "/api/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> uploadFilesToDO(
            @RequestHeader("Authorization") String firebaseUUID,
            @RequestPart("file") MultipartFile file,
            @RequestPart("comments") String comments,
            @RequestPart(value = "trip_id", required = false) String trip_id,
            @RequestPart(value = "accommodation_id", required = false) String accommodation_id,
            @RequestPart(value= "activity_id", required = false) String activity_id,
            @RequestPart(value = "flight_id", required = false) String flight_id,
            @RequestPart(value = "user_id_pp", required = false) String user_id_pp,
            @RequestPart(value = "original_file_name", required = false) String original_file_name

    ) {

        if (firebaseUUID.isEmpty()) {
            JsonObject replyForUnAuthorized = Json.createObjectBuilder()
                    .add("response", "Unauthorized")
                    .build();
            return ResponseEntity.status(401).body(replyForUnAuthorized.toString());
        }

        try {
            String resourceId = allfilesserve.resourceIdGenerator(comments);
            System.out.println("check here: " + resourceId);
            FileObject newResource = new FileObject();
            newResource.setResourceId(resourceId);

            // Check for null or empty values for the optional fields and set them to null if not provided
        newResource.setTrip_id(trip_id != null && !trip_id.isEmpty() ? trip_id : null);
        newResource.setAccommodation_id(accommodation_id != null && !accommodation_id.isEmpty() ? accommodation_id : null);
        newResource.setActivity_id(activity_id != null && !activity_id.isEmpty() ? activity_id : null);
        newResource.setFlight_id(flight_id != null && !flight_id.isEmpty() ? flight_id : null);
        newResource.setUser_id_pp(user_id_pp != null && !user_id_pp.isEmpty() ? user_id_pp : null);

            String formattedOriName = original_file_name.replace(" ", "_");
            String shortenIfTooLong = "";
            if (formattedOriName.length() > 99) {
                shortenIfTooLong = formattedOriName.substring(0, 98);
            } else {
                shortenIfTooLong = formattedOriName;
            }

            newResource.setOriginal_file_name(shortenIfTooLong);

            // once successful upload to DO, save IN SQL: cdn url, file name, also what
            // parts of the app
            // this resource is tied to in the app. only if SQL insert successful then
            // return cdn url and resourceId
            // insert into sql
            FileObject finalFileObjectSuccessToDO = allfilesserve.uploadFile(file, comments, resourceId, newResource);

            FileObject finalFileSuccessSQL = fileServiceSql.upload(finalFileObjectSuccessToDO);

            if (finalFileSuccessSQL != null) {

                JsonObject toReturnJson = Json.createObjectBuilder()
                        .add("do_url", finalFileSuccessSQL.getDo_src_link())
                        .add("resource_id", resourceId)
                        .add("fileOriginalName", finalFileSuccessSQL.getOriginal_file_name())
                        .add("uploadedOn", finalFileSuccessSQL.getUploaded_on().toString())
                        // for frontend to know to load resource in <img> or another way for docs
                        .add("resourceType", allfilesserve.resourceType(resourceId))
                        .build();
                return ResponseEntity.status(200).body(toReturnJson.toString());

            } else {
                throw new Exception("Error on server front");

            }

        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
        }

    }

    @GetMapping(path = "/api/get-resources/{resourceId}")
    public ResponseEntity<String> getFileByResourceId(
            @RequestHeader("Authorization") String firebaseUUID,
            @PathVariable("resourceId") String resourceId) {

        if (firebaseUUID.isEmpty()) {
            JsonObject replyForUnAuthorized = Json.createObjectBuilder()
                    .add("response", "Unauthorized")
                    .build();
            return ResponseEntity.status(401).body(replyForUnAuthorized.toString());
        }

        Optional<FileObject> object = fileServiceSql.getFileById(resourceId);
        System.out.println("Get service triggered, getting resource >>>. " + resourceId);
        if (!object.isEmpty()) {

            FileObject p = object.get();
            JsonObject toReturnJson = Json.createObjectBuilder()
                    .add("do_url", p.getDo_src_link())
                    .add("resource_id", resourceId)
                    .add("uploadedOn", p.getUploaded_on().toString())
                    // for frontend to know to load resource in <img> or another way for docs
                    .add("resourceType", allfilesserve.resourceType(resourceId))
                    .add("fileOriginalName", p.getOriginal_file_name())
                    .build();

            return ResponseEntity.status(200).body(toReturnJson.toString());

        } else {

            return ResponseEntity.status(505).body("Error");
        }

    }

    @GetMapping(path = "/api/get-resources-trip/{tripId}")
    public ResponseEntity<String> getFilesByTripId(
            @RequestHeader("Authorization") String firebaseUUID,
            @PathVariable("tripId") String tripId) {
        if (firebaseUUID.isEmpty()) {
            JsonObject replyForUnAuthorized = Json.createObjectBuilder()
                    .add("response", "Unauthorized")
                    .build();
            return ResponseEntity.status(401).body(replyForUnAuthorized.toString());
        }

        List<FileObject> files = fileServiceSql.getFilesByTripId(tripId);
        System.out.println("Get servic allo doc for trip triggered, getting resources >>>. " + tripId);

        if (!files.isEmpty()) {
            JsonArrayBuilder jsonArrayBuilder = Json.createArrayBuilder();

            for (FileObject file : files) {
                JsonObject toReturnJson = Json.createObjectBuilder()
                        .add("do_url", file.getDo_src_link())
                        .add("resource_id", file.getResourceId()) // Assuming the FileObject has resourceId
                        .add("uploadedOn", file.getUploaded_on().toString())
                        .add("resourceType", allfilesserve.resourceType(file.getResourceId()))
                        .add("fileOriginalName", file.getOriginal_file_name())
                        .build();
                jsonArrayBuilder.add(toReturnJson);
            }

            return ResponseEntity.status(200).body(jsonArrayBuilder.build().toString());
        } else {
            return ResponseEntity.status(505).body("Error: No resources found");
        }
    }

    // @PostMapping("/api/upload-pexel")
    // public ResponseEntity<String> uploadThePexelFetchImage(
    //         @RequestHeader("Authorization") String firebaseUUID,
    //         @RequestBody String payload) throws IOException, SQLException {
    //     // Check if the Firebase UUID is present
    //     if (firebaseUUID.isEmpty()) {
    //         JsonObject replyForUnAuthorized = Json.createObjectBuilder()
    //                 .add("response", "Unauthorized")
    //                 .build();
    //         return ResponseEntity.status(401).body(replyForUnAuthorized.toString());
    //     }

    //     // Parse the incoming JSON payload
    //     JsonObject photoTripUser = Json.createReader(new StringReader(payload)).readObject();

    //     // Validate the presence of 'photourl'
    //     if (photoTripUser.getString("photourl").isEmpty()) {
    //         JsonObject replyForNullValue = Json.createObjectBuilder()
    //                 .add("response", "Missing photourl")
    //                 .build();
    //         return ResponseEntity.status(400).body(replyForNullValue.toString());
    //     }

    //     // Generate a resource ID
    //     String resourceId = allfilesserve.resourceIdGenerator(photoTripUser.getString("comments"));
    //     System.out.println("Generated resource ID: " + resourceId);

    //     // Create a new FileObject to store the details
    //     FileObject newResource = new FileObject();
    //     newResource.setResourceId(resourceId);

    //     // Tie the resource to the trip and other components
    //     newResource.setTrip_id(photoTripUser.getString("trip_id"));
    //     newResource.setDo_src_link(photoTripUser.getString("photourl"));
    //     newResource.setMedia_type(photoTripUser.getString("media_type"));
    //     newResource.setOriginal_file_name(resourceId + "_cover_image");

    //     try {
    //         // Upload the file to the database
    //         FileObject finalFileSuccessSQL = fileServiceSql.upload(newResource);

    //         if (finalFileSuccessSQL != null) {
    //             // Prepare the response JSON to return to the frontend
    //             JsonObject toReturnJson = Json.createObjectBuilder()
    //                     .add("do_url", finalFileSuccessSQL.getDo_src_link())
    //                     .add("resource_id", resourceId)
    //                     .add("fileOriginalName", finalFileSuccessSQL.getOriginal_file_name())
    //                     .add("uploadedOn", finalFileSuccessSQL.getUploaded_on().toString())
    //                     // For frontend to know to load resource in <img> or another way for docs
    //                     .add("resourceType", allfilesserve.resourceType(resourceId))
    //                     .build();
    //             return ResponseEntity.status(200).body(toReturnJson.toString());
    //         } else {
    //             // If the file upload fails, throw an exception
    //             throw new Exception("Error during file upload.");
    //         }
    //     } catch (Exception e) {
    //         // Handle any server-side errors (e.g., database issues)
    //         JsonObject errorResponse = Json.createObjectBuilder()
    //                 .add("response", "Internal server error")
    //                 .add("message", e.getMessage())
    //                 .build();
    //         return ResponseEntity.status(500).body(errorResponse.toString());
    //     }
    // }

}
