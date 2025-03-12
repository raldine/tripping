package trippingactual.server.authController;

import java.nio.charset.StandardCharsets;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.json.Json;
import jakarta.json.JsonObject;

// import com.google.api.client.util.Value;
// import com.google.firebase.auth.FirebaseToken;

// import trippingactual.server.services.FirebaseAuthService;
import trippingactual.server.services.UserService;
// import trippingactual.server.utils.JwtUtil;

@RestController
@RequestMapping("/authen")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {


    // @Autowired
    // private FirebaseAuthService firebaseAuthenService;

    @Autowired
    private UserService userService;

         // @Value("${jwt.auth.secret.key}")
         private String SECRET_KEY="niofbno3q2j39oj9-45h08022AWRADEdnmiakndiwnklskLsssdaw@";
        // Generate the SecretKey from the string

        private byte[] keyBytes = SECRET_KEY.getBytes(StandardCharsets.UTF_8);

        // Create the SecretKey using the SecretKeySpec class
        private SecretKey secretKey = new SecretKeySpec(keyBytes, "HmacSHA256");

    @PostMapping()
    public ResponseEntity<String> authenAndIssueJWT(
        // @RequestHeader("firebaseTokenId") String firebaseTokenId,
        @RequestHeader("firebaseUid") String firebaseUid,
        @RequestHeader("email") String email
    ) throws Exception{

        System.out.println("RECEIVED REQUEST AND PROCESSING");


        String statusOfUserAuthen = userService.checkIfUserExistElseInsert(firebaseUid, email);

        JsonObject payloadIfOk = Json.createObjectBuilder()
                                .add("response", "OK")
                                .build();
   JsonObject payloadError = Json.createObjectBuilder()
                                .add("response", "Error")
                                .build();



        if (statusOfUserAuthen.equals("new registered")){
            String check = userService.checkIfUserPassFurtherReg(email);

            return ResponseEntity.ok()
            .header("userstatus", "new registered")
            .header("furtherReg", check)
            .body(payloadIfOk.toString());
        }

        if(statusOfUserAuthen.equals("exists")){
            String check = userService.checkIfUserPassFurtherReg(email);

            return ResponseEntity.ok()
            .header("userstatus", "exists")
            .header("furtherReg", check)
            .body(payloadIfOk.toString());
        }

        else {
            return ResponseEntity.internalServerError()
            // .headers(headers)
            .body(payloadError.toString())
            ;
        }






    }



    
}
