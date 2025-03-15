package trippingactual.server.services;


import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.json.JsonObject;
import trippingactual.server.models.TripInfo;
import trippingactual.server.repositories.TripsRepo;

@Service
public class TripService {

    @Autowired
    private TripsRepo tripsRepo;

    public String putNewTrip(TripInfo tripInfoInJson) {

        String replyFromRepo = tripsRepo.putNewTrip(tripInfoInJson);

        return replyFromRepo;

    }

    public List<TripInfo> getAllTripsByUserId(String firebaseuid){
        List<TripInfo> trips = new ArrayList<>();

        trips = tripsRepo.getAllTripsByUserId(firebaseuid);

        return trips;
        
    }



}
