package trippingactual.server.authController;

import java.io.StringReader;
import java.nio.charset.StandardCharsets;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import jakarta.json.JsonReader;


import trippingactual.server.services.UserService;


@RestController
@RequestMapping("/authen")
@CrossOrigin(origins = "https://tripping-app.com/", // Allowed origin
        allowCredentials = "false" // No need to allow credentials for Authorization header)
) // Allowed origin
public class AuthController {


    @Autowired
    private UserService userService;

  

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> authenAndIssueJWT(
        @RequestBody String payload
    ) throws Exception{

        System.out.println("RECEIVED REQUEST AND PROCESSING");

        JsonReader reader = Json.createReader(new StringReader(payload));

        JsonObject payloadconvert  = reader.readObject();
        System.out.println("read " + payloadconvert.toString());

        String firebaseUid = payloadconvert.getString("firebaseUid");
        String email = payloadconvert.getString("email");


        String statusOfUserAuthen = userService.checkIfUserExistElseInsert(firebaseUid, email);

        JsonObjectBuilder payloadIfOk = Json.createObjectBuilder()
                                .add("response", "OK");
                          
   JsonObjectBuilder payloadError = Json.createObjectBuilder()
                                .add("response", "Error");
                        


        if (statusOfUserAuthen.equals("new registered")){
            String check = userService.checkIfUserPassFurtherReg(email);

            payloadIfOk.add("userstatus", "new registered");
            payloadIfOk.add("furtherReg", check);

            return ResponseEntity.ok()
            .header("userstatus", "new registered")
            .header("furtherReg", check)
            .body(payloadIfOk.build().toString());
        }

        if(statusOfUserAuthen.equals("exists")){
            String check = userService.checkIfUserPassFurtherReg(email);

            payloadIfOk.add("userstatus", "exists");
            payloadIfOk.add("furtherReg", check);

            return ResponseEntity.ok()
            .header("userstatus", "exists")
            .header("furtherReg", check)
            .body(payloadIfOk.build().toString());
        }

        else {
            return ResponseEntity.internalServerError()
            // .headers(headers)
            .body(payloadError.toString())
            ;
        }






    }



    
}
