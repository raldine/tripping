package trippingactual.server.RestControllers;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import trippingactual.server.services.ImageFetchingPexelService;

@RestController
@RequestMapping
@CrossOrigin("http://localhost:4200")
public class ImageFetchPexelBay {


    @Autowired
    private ImageFetchingPexelService pexelService;

    @GetMapping("/api/pexels")
    public ResponseEntity<String> getRandomCoverImage(
        @RequestParam("q") String query
    ){

        String queryFixed = query.replaceAll("-", " ");

        String reply = pexelService.getRandomImageUrl(queryFixed);

        if (!reply.equals("No images found") || !reply.equals("Error")){
            JsonObject replyWithPhotoUrl = Json.createObjectBuilder()
                                            .add("photourl", reply)
                                            .build();

            return ResponseEntity.ok().body(replyWithPhotoUrl.toString());
        } else {

            JsonObject replyWithError = Json.createObjectBuilder()
                                        .add("error", "No images found or server error")
                                        .build();
            return ResponseEntity.internalServerError().body(replyWithError.toString());
        }


    }
    
}
