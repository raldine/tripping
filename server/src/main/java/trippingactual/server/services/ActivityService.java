package trippingactual.server.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import trippingactual.server.models.ActivityObj;
import trippingactual.server.models.TripInfo;
import trippingactual.server.repositories.ActivityRepo;

@Service
public class ActivityService {

    @Autowired
    private ActivityRepo actRepo;

       public List<ActivityObj> getAllActivitiesByTripId(String trip_id){
        List<ActivityObj> activities = new ArrayList<>();

        activities = actRepo.getAllActivitiesForTrip(trip_id);

        return activities;
        
    }
    
}
