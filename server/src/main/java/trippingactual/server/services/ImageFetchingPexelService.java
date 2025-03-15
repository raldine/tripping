package trippingactual.server.services;

import java.io.StringReader;
import java.util.Random;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;

@Service
public class ImageFetchingPexelService {


     @Value("${pexels.api.key}")  // Read API key from `application.properties`
    private String apiKey;

      public String getRandomImageUrl(String query) {
        // Construct Pexels API URL
        String url = "https://api.pexels.com/v1/search?query=" + query +  "&orientation=landscape&per_page=10";

        // Set HTTP Headers
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", apiKey);  // Set Pexels API Key
    


        RequestEntity<Void> req = RequestEntity
                            .get(url)
                            .header("Authorization", apiKey)
                            .accept(MediaType.APPLICATION_JSON)
                            .build();

       RestTemplate template =  new RestTemplate();

       ResponseEntity<String> resp;

       try{

        //actual exchange:
        resp = template.exchange(req, String.class); //String.class as we are expecting JsonObject String
        
        //read what has been gotten
        String payload = resp.getBody(); //pure data in string
        JsonReader reader = Json.createReader(new StringReader(payload)); // read in Json for received String
        JsonObject wholeObh = reader.readObject();
                JsonArray photosArray = wholeObh.getJsonArray("photos");

                if (photosArray != null && !photosArray.isEmpty()) {
                    // Select a random photo from the results
                    Random random = new Random();
                    int randomIndex = random.nextInt(photosArray.size());

                    JsonObject selectedPhoto = photosArray.getJsonObject(randomIndex);
                    JsonObject srcObject = selectedPhoto.getJsonObject("src");

                    return srcObject.getString("large2x", "No Image URL Found");
                }
     
            } catch (Exception ex){
                ex.printStackTrace();
                System.out.println(ex.getMessage());
                return "No images found";  // Default return if no images

            }

            return "Error";
   
        }

    }

