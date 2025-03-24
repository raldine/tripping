package trippingactual.server.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import trippingactual.server.models.AccommObject;
import trippingactual.server.models.LocationObject;
import trippingactual.server.repositories.LocationRepo;

@Service
public class LocationService {

    @Autowired
    private LocationRepo locatRepo;

    public Optional<LocationObject> getLocatbjectByLocationId(String location_id) {

        Optional<LocationObject> location = locatRepo.getLocaObjByAcc_ID(location_id);

        return location;

    }

      public List<LocationObject> getManyLocationsByTripId(String tripId){

        List<LocationObject> locations = new ArrayList<>();

        locations = locatRepo.getManyLocationsDetailsByTripId(tripId);


        return locations;
    }

    

}
