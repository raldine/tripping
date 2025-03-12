package trippingactual.server.RestControllers;

import java.net.http.HttpHeaders;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
// import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// import com.google.api.client.util.Value;

// import com.google.rpc.context.AttributeContext.Response;

import jakarta.json.Json;
import jakarta.json.JsonObject;

@RestController
@RequestMapping("/api/googlekey")
@CrossOrigin(origins = "http://localhost:4200")
public class GoogleMapsApiKeyController {

    @Value("${google.map.key}")
    private String google_api_key;

    @GetMapping()
    public ResponseEntity<String> getGoogleMapApiKey(

            String email) {

        System.out.println("gooogle key is " + google_api_key);

        JsonObject api_key = Json.createObjectBuilder()
                .add("api_key", google_api_key)
                .build();
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(api_key.toString());

    }

}
