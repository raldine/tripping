package trippingactual.server.services;


import java.text.SimpleDateFormat;
import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.json.JsonObject;
import trippingactual.server.models.TripInfo;
import trippingactual.server.repositories.TripsRepo;

@Service
public class TripService {

    @Autowired
    private TripsRepo tripsRepo;

    public String putNewTrip(JsonObject tripInfoInJson) {


        TripInfo tripInfoNew = TripInfo.fromJsonToTripInfo(tripInfoInJson);

        String replyFromRepo = tripsRepo.putNewTrip(tripInfoNew);

        return replyFromRepo;

    }



}
