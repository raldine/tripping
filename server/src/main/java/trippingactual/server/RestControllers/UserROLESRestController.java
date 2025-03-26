package trippingactual.server.RestControllers;

import java.io.StringReader;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.json.Json;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import trippingactual.server.models.LocationObject;
import trippingactual.server.models.UserRoles;
import trippingactual.server.services.UserROLESService;

@RestController
@RequestMapping("/api/roles")
@CrossOrigin(origins = "https://tripping-app.com/", // Allowed origin
        allowCredentials = "false" // No need to allow credentials for Authorization header)
) // Allowed origin
public class UserROLESRestController {

    @Autowired
    private UserROLESService userROLESService;

    @PutMapping(path = "/registerEditor", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> registerNewEditorForTrip(
            @RequestBody String payload) {


        //read Json
        JsonReader reader = Json.createReader(new StringReader(payload));
        JsonObject userInfo = reader.readObject();

        UserRoles userRoleReceived = UserRoles.fromJsonToUsrRole(userInfo);
        System.out.println("received user ROLE info is " + userInfo.toString());

        String replyFromRepo = userROLESService.registerUserRoleEditorInExistingTrip(userRoleReceived);

        if(!replyFromRepo.equals("error")){
            JsonObject replyToAngular = Json.createObjectBuilder()
            .add("response", "Registered as editor")
            .build();
            return ResponseEntity.ok().body(replyToAngular.toString());

        } else {
            JsonObject replyToAngular = Json.createObjectBuilder()
            .add("response", "Error registering editor")
            .build();
            return ResponseEntity.internalServerError().body(replyToAngular.toString());
        }
    }
    @PutMapping(path = "/registerViewer", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> registerNewVIEWERForTrip(
            @RequestBody String payload) {


        //read Json
        JsonReader reader = Json.createReader(new StringReader(payload));
        JsonObject userInfo = reader.readObject();

        UserRoles userRoleReceived = UserRoles.fromJsonToUsrRole(userInfo);
        System.out.println("received user ROLE info is " + userInfo.toString());

        String replyFromRepo = userROLESService.registerUserRoleVIEWONLYInExistingTrip(userRoleReceived);

        if(!replyFromRepo.equals("error")){
            JsonObject replyToAngular = Json.createObjectBuilder()
            .add("response", "Registered as viewer")
            .build();
            return ResponseEntity.ok().body(replyToAngular.toString());

        } else {
            JsonObject replyToAngular = Json.createObjectBuilder()
            .add("response", "Error")
            .build();
            return ResponseEntity.internalServerError().body(replyToAngular.toString());
        }
    }

    @GetMapping(path = "/get-user-role", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getUserRoleByTripidAndUserId(
        @RequestHeader("Authorization") String firebaseUid,
        @RequestParam("user_id") String user_id,
        @RequestParam("trip_id") String trip_id
    ){
        
    if (firebaseUid.isEmpty()) {
            JsonObject replyForUnAuthorized = Json.createObjectBuilder()
                    .add("response", "Unauthorized")
                    .build();
            return ResponseEntity.status(401).body(replyForUnAuthorized.toString());
    }

        String roleOfUser = userROLESService.getUsersRoleForParticularTrip(user_id, trip_id);
        
        if(!roleOfUser.equals("not exist")){
          JsonObject reply = Json.createObjectBuilder()
                            .add("response", roleOfUser)
                            .build();

            return ResponseEntity.ok().body(reply.toString());


        } else{
            JsonObject replyForError = Json.createObjectBuilder()
            .add("response", "Error: No role found")
            .build();

            return ResponseEntity.status(204).body(replyForError.toString());
        }

    }

    @GetMapping(path = "/get-trip-shareId", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getShareIdORViewId(
        @RequestHeader("Authorization") String firebaseUid,
        @RequestParam("id_to_get") String id_to_get,
        @RequestParam("trip_id") String trip_id
    ){
        
    if (firebaseUid.isEmpty()) {
            JsonObject replyForUnAuthorized = Json.createObjectBuilder()
                    .add("response", "Unauthorized")
                    .build();
            return ResponseEntity.status(401).body(replyForUnAuthorized.toString());
    }

        String shareIdORshareViewOnlyId = "";
        if(id_to_get.equals("edit")){
            System.out.println("getting share_id");
            shareIdORshareViewOnlyId = userROLESService.getShareIDForTrip(trip_id, firebaseUid);
        }

        if(id_to_get.equals("view")){
            System.out.println("getting share_id VIEW ONLY");
            shareIdORshareViewOnlyId = userROLESService.getShareIDVIEWONLYForTrip(trip_id, firebaseUid);

        }
        
        if(!shareIdORshareViewOnlyId.equals("failed")){
          JsonObject reply = Json.createObjectBuilder()
                            .add("response", shareIdORshareViewOnlyId)
                            .build();

            return ResponseEntity.ok().body(reply.toString());


        } else{
            JsonObject replyForError = Json.createObjectBuilder()
            .add("response", "Error: No share_id found")
            .build();

            return ResponseEntity.status(505).body(replyForError.toString());
        }

    }

     @GetMapping(path = "/get-all-userRoles", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getAllUSERSROLESFortrip(
        @RequestHeader("Authorization") String firebaseUid,
        @RequestParam("trip_id") String trip_id)
    {

        if (firebaseUid.isEmpty()) {
            JsonObject replyForUnAuthorized = Json.createObjectBuilder()
                    .add("response", "Unauthorized")
                    .build();
            return ResponseEntity.status(401).body(replyForUnAuthorized.toString());
        }

        List<UserRoles> fromRepo = userROLESService.getALLUSERSROLESFORATRIP(trip_id);
        
        if(!fromRepo.isEmpty()){
            JsonArrayBuilder buildArray = Json.createArrayBuilder();

            for(UserRoles userR : fromRepo){
                JsonObject temp = userR.toJson();
                buildArray.add(temp);
            }

            return ResponseEntity.ok().body(buildArray.build().toString());
        } else {
            JsonObject replyForError = Json.createObjectBuilder()
            .add("response", "No user roles found")
            .build();
    return ResponseEntity.status(204).body(replyForError.toString());
        }

    }


}
