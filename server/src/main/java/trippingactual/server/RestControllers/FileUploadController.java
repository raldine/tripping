package trippingactual.server.RestControllers;

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
            @RequestPart("trip_id") String trip_id,
            @RequestPart("accommodation_id") String accommodation_id,
            @RequestPart("activity_id") String activity_id,
            @RequestPart("flight_id") String flight_id,
            @RequestPart("user_id_pp") String user_id_pp,
            @RequestPart("original_file_name") String original_file_name

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

            // tieing resource to relevant components
            newResource.setTrip_id(trip_id);
            newResource.setAccommodation_id(accommodation_id);
            newResource.setActivity_id(activity_id);
            newResource.setFlight_id(flight_id);
            newResource.setUser_id_pp(user_id_pp);

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

}
