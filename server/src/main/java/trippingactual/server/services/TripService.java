package trippingactual.server.services;


import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.json.JsonObject;
import trippingactual.server.models.ItineraryObject;
import trippingactual.server.models.TripInfo;
import trippingactual.server.repositories.ItnRepo;
import trippingactual.server.repositories.TripsRepo;

@Service
public class TripService {

    @Autowired
    private TripsRepo tripsRepo;

    @Autowired
    private ItineraryBuilder itineraryBuilder;

    @Autowired
    private ItnRepo itineraryRepo;


    @Transactional(rollbackFor = Exception.class)
    public String putNewTrip(TripInfo tripInfoObj) {

        String replyFromRepo = tripsRepo.putNewTrip(tripInfoObj);

        List<ItineraryObject> itineraryObjects = itineraryBuilder.generateItineraryIds(tripInfoObj.getTrip_id(), tripInfoObj.getStart_date(), tripInfoObj.getEnd_date());

        itineraryRepo.addNewItineraries(itineraryObjects);


        return replyFromRepo;

    }

    public List<TripInfo> getAllTripsByUserId(String firebaseuid){
        List<TripInfo> trips = new ArrayList<>();

        trips = tripsRepo.getAllTripsByUserId(firebaseuid);

        return trips;
        
    }


    public String deleteTripByTripId (String trip_id){

        String replyFromRepo = tripsRepo.deleteTripByTrip_id(trip_id);

        return replyFromRepo;
    }



}
