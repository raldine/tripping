package trippingactual.server.RestControllers;

import java.net.http.HttpHeaders;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
// import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// import com.google.api.client.util.Value;

// import com.google.rpc.context.AttributeContext.Response;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import trippingactual.server.services.GooglePlacesServiceLatLng;

@RestController
@RequestMapping("/api/googlekey")
@CrossOrigin(origins = "http://localhost:4200")
public class GoogleMapsApiKeyController {

    @Value("${google.map.key}")
    private String google_api_key;


    @Autowired
    private GooglePlacesServiceLatLng latLngService;

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

    @GetMapping("/getlatlng")
    public ResponseEntity<String> getPlaceLatLngFromPlaceId(
        @RequestParam("place_id") String place_id
    ){

        String replyFromService = latLngService.getPlaceLatLngByPlaceId(place_id);

        if(replyFromService.equals("Error")){

                JsonObject replyError = Json.createObjectBuilder()
                                        .add("result", "Error getting lat lng")
                                        .build();

                return ResponseEntity.internalServerError().body(replyError.toString());
        } else  {
                JsonObject replySuccess = Json.createObjectBuilder()
                                        .add("result", replyFromService.toString())
                                        .build();

                return ResponseEntity.ok().body(replySuccess.toString());
        }

    }

}
