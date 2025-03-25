package trippingactual.server.RestControllers;

import java.io.StringReader;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import trippingactual.server.services.UserService;

@RestController
@RequestMapping("/api/register")
@CrossOrigin(origins = "http://*",  // Allowed origin
allowCredentials = "false"  // No need to allow credentials for Authorization header)
)
public class RegistrationController {

    @Autowired
    public UserService userService;

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> registerFurther(
        @RequestBody String payload
    ){

        //read Json
        JsonReader reader = Json.createReader(new StringReader(payload));
        JsonObject userInfo = reader.readObject();
        System.out.println("received user info is " + userInfo.toString());


        String replyFromRepo = userService.furtherRegisterUser(userInfo);


        JsonObject replyToAngular = Json.createObjectBuilder()
                                    .add("response", replyFromRepo)
                                    .build();


        
        return ResponseEntity.ok().body(replyToAngular.toString());

    }
    
}
