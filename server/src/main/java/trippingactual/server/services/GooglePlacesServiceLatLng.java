package trippingactual.server.services;


import java.io.StringReader;
import java.security.DrbgParameters.Reseed;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import jakarta.json.Json;
import jakarta.json.JsonObject;

@Service
public class GooglePlacesServiceLatLng {

@Value("${google.map.key}")
    private String google_api_key;


    String get_url = "https://maps.googleapis.com/maps/api/place/details/json?place_id=";
    public String getPlaceLatLngByPlaceId(String placeId){

       String final_get_url= get_url+ placeId + "&fields=geometry&key="+google_api_key;

       RequestEntity<Void> req = RequestEntity
                                .get(final_get_url)
                                .accept(MediaType.APPLICATION_JSON)
                                .build();


        RestTemplate template = new RestTemplate();

        ResponseEntity<String> resp;


        try{
            resp = template.exchange(req, String.class);

            String payload = resp.getBody();

            JsonObject responseObj = Json.createReader(new StringReader(payload))
                                    .readObject();

            JsonObject resultObj = responseObj.getJsonObject("result");

            JsonObject geomObject = resultObj.getJsonObject("geometry");

            JsonObject locationObj = geomObject.getJsonObject("location");

            System.out.println(locationObj.toString());

            return locationObj.toString();
        } catch (Exception ex) {

            return "Error";

        }

    }
}
