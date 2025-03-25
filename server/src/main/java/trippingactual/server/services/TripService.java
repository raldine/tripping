package trippingactual.server.services;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import io.micrometer.core.annotation.Timed;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import jakarta.json.JsonObject;
import trippingactual.server.models.ItineraryObject;
import trippingactual.server.models.LocationObject;
import trippingactual.server.models.TripInfo;
import trippingactual.server.models.UserRoles;
import trippingactual.server.repositories.ItnRepo;
import trippingactual.server.repositories.TripsRepo;
import trippingactual.server.repositories.UserRolesRepo;

@Service
public class TripService {

    @Autowired
    private TripsRepo tripsRepo;

    @Autowired
    private ItineraryBuilder itineraryBuilder;

    @Autowired
    private ItnRepo itineraryRepo;

    @Autowired
    private UserRolesRepo userRolesRepo;

      @Autowired
    private MeterRegistry meterRegistry;

   
    // @Timed(value = "myapp_tripping_trip_creation_time", description = "Time taken to create a trip")
    @Transactional(rollbackFor = Exception.class)
    public String putNewTrip(TripInfo tripInfoObj, String master_user_display_name, String master_user_email) {

        Timer.Sample sample = Timer.start(meterRegistry);

        try{

        String replyFromRepo = tripsRepo.putNewTrip(tripInfoObj);

        List<ItineraryObject> itineraryObjects = itineraryBuilder.generateItineraryIds(tripInfoObj.getTrip_id(),
                tripInfoObj.getStart_date(), tripInfoObj.getEnd_date());

        itineraryRepo.addNewItineraries(itineraryObjects);

        String share_id = UUID.randomUUID().toString().replaceAll("-", "").substring(0,24);
        String share_id_view_only = UUID.randomUUID().toString().replaceAll("-", "").substring(0,24);

        UserRoles newMasterUser = new UserRoles();
        newMasterUser.setTrip_id(tripInfoObj.getTrip_id());
        newMasterUser.setUser_id(tripInfoObj.getMaster_user_id());
        newMasterUser.setRole("Master");
        newMasterUser.setUser_display_name(master_user_display_name);
        newMasterUser.setUser_email(master_user_email);
        newMasterUser.setShare_id(share_id);
        newMasterUser.setShare_id_view_only(share_id_view_only);

        String successUserRolesEstablish = userRolesRepo.initNewUserRoleForTrip(newMasterUser);

        if(successUserRolesEstablish.equals("OK")){
            System.out.println("SUCCESS MADE USER ROLE FOR NEW TRIP");
        }


        return replyFromRepo;

    } finally {
        //Stop the timer and record the time
        sample.stop(
            Timer.builder("myapp_tripping_trip_creation_time")
                .description("Time taken to create a trip manually")
                .register(meterRegistry)
        );
    }

    }

    public List<TripInfo> getAllTripsByUserId(String firebaseuid) {
        List<TripInfo> trips = new ArrayList<>();

        trips = tripsRepo.getAllTripsByUserId(firebaseuid);

        return trips;

    }

    public String deleteTripByTripId(String trip_id) {

        String replyFromRepo = tripsRepo.deleteTripByTrip_id(trip_id);

        return replyFromRepo;
    }

    public Optional<TripInfo> getTripDetailsByTripId(String trip_id) {

        Optional<TripInfo> trip = tripsRepo.getTripById(trip_id);

        return trip;

    }

}
