package trippingactual.server.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import trippingactual.server.models.ActivityObj;
import trippingactual.server.models.LocationObject;
import trippingactual.server.models.TripInfo;
import trippingactual.server.repositories.ActivityRepo;
import trippingactual.server.repositories.LocationRepo;

@Service
public class ActivityService {

    @Autowired
    private ActivityRepo actRepo;

    @Autowired
    private LocationRepo locationRepo;

       public List<ActivityObj> getAllActivitiesByTripId(String trip_id){
        List<ActivityObj> activities = new ArrayList<>();

        activities = actRepo.getAllActivitiesForTrip(trip_id);

        return activities;
        
    }

    @Transactional(rollbackFor = Exception.class)
    public String insertNewActivityInTable(ActivityObj newActivity, LocationObject locationOfActivity){

        String replyFromRepo = actRepo.insertActivityTable(newActivity);

        String replyFromLocationRepo = locationRepo.insertLocationTable(locationOfActivity);
        if(replyFromLocationRepo.equals("OK") && replyFromRepo.equals("OK")){
            return replyFromRepo;
        } else {
            return "failed";
        }

       
    }

    public String deleteActivityByActivityid(String activity_id) {

        String replyFromRepo = actRepo.deleteActivityById(activity_id);

        return replyFromRepo;
    }
    
}
