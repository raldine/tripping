package trippingactual.server.services;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import trippingactual.server.models.ItineraryObject;
import trippingactual.server.repositories.ItnRepo;

@Service
public class ItineraryBuilder {

    @Autowired
    private ItnRepo itineraryRepo;

    public List<ItineraryObject> generateItineraryIds(String tripId, Date startDate, Date endDate) {
        List<ItineraryObject> itineraries = new ArrayList<>();
   
        
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(startDate);

        while (!calendar.getTime().after(endDate)) {
            String itineraryId = "itner" + UUID.randomUUID().toString().replaceAll("-", "").substring(0,24);
            Date forItn = calendar.getTime();
            ItineraryObject perDay = new ItineraryObject();
            perDay.setItinerary_id(itineraryId);
            perDay.setItn_date(forItn);
            perDay.setTrip_id(tripId); 
            itineraries.add(perDay);
            
            calendar.add(Calendar.DATE, 1);
        }
        
        List<String> toCheck = new ArrayList<>();
        for(ItineraryObject itn : itineraries){
            toCheck.add(itn.getItn_date().toString());
        }
        System.out.println("itinerary created for " + tripId + " is : " + toCheck.toString());
        return itineraries;
    }


    public List<ItineraryObject> getItnryFromTripId(String trip_id){

        List<ItineraryObject> fromRepo = itineraryRepo.getItnryByTripId(trip_id);

        return fromRepo;

    }
    
}
