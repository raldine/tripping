package trippingactual.server.RestControllers;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.json.Json;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObject;

import trippingactual.server.models.UserInfo;
import trippingactual.server.services.UserService;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "https://tripping-app.com/", // Allowed origin
        allowCredentials = "false" // No need to allow credentials for Authorization header)
) // Allowed origin
public class UserDetailRestController {

    @Autowired
    private UserService userService;

      @GetMapping(path = "/get-user/{firebaseId}")
    public ResponseEntity<String> getUserByFirebaseUid(
            @RequestHeader("Authorization") String firebaseUUID,
            @PathVariable("firebaseId") String firebaseId) {

        if (firebaseUUID.isEmpty()) {
            JsonObject replyForUnAuthorized = Json.createObjectBuilder()
                    .add("response", "Unauthorized")
                    .build();
            return ResponseEntity.status(401).body(replyForUnAuthorized.toString());
        }

        Optional<UserInfo> object = userService.getUserDetailsByFireBaseID(firebaseId);
        System.out.println("Get service triggered, getting user >>>. " + firebaseId);
        if (!object.isEmpty()) {

            UserInfo p = object.get();
            JsonObject toReturnJson = p.toJson();
            return ResponseEntity.status(200).body(toReturnJson.toString());

        } else {

            return ResponseEntity.status(505).body("Error");
        }
    
}

@GetMapping(path = "/get-users/{firebaseIds}")
public ResponseEntity<String> getUsersByFirebaseUids(
        @RequestHeader("Authorization") String firebaseUUID,
        @PathVariable("firebaseIds") String firebaseIds) {

    if (firebaseUUID.isEmpty()) {
        JsonObject replyForUnAuthorized = Json.createObjectBuilder()
                .add("response", "Unauthorized")
                .build();
        return ResponseEntity.status(401).body(replyForUnAuthorized.toString());
    }

    // Split the comma-separated list of firebaseIds
    List<String> firebaseIdList = Arrays.asList(firebaseIds.split(","));
    
    List<UserInfo> users = userService.getManyUsersDetailsByFireBaseIDs(firebaseIdList);
    System.out.println("Get service triggered, getting users >>>. " + firebaseIdList);

    if (!users.isEmpty()) {
        JsonArrayBuilder jsonArrayBuilder = Json.createArrayBuilder();

        // Convert each UserInfo object to JSON and add it to the array
        for (UserInfo user : users) {
            JsonObject toReturnJson = user.toJson();
            jsonArrayBuilder.add(toReturnJson);
        }

        return ResponseEntity.status(200).body(jsonArrayBuilder.build().toString());
    } else {
        JsonObject replyForError = Json.createObjectBuilder()
                .add("response", "Error: No users found")
                .build();
        return ResponseEntity.status(505).body(replyForError.toString());
    }
}





}
