package trippingactual.server.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import trippingactual.server.models.AccommObject;
import trippingactual.server.models.ActivityObj;
import trippingactual.server.models.LocationObject;
import trippingactual.server.repositories.AccommodationRepo;
import trippingactual.server.repositories.ActivityRepo;
import trippingactual.server.repositories.LocationRepo;

@Service
public class AccommodationService {

    @Autowired
    private AccommodationRepo accRepo;

    @Autowired
    private LocationRepo localRepo;

    @Autowired
    private ActivityRepo activityRepo;


    @Transactional(rollbackFor = DataAccessException.class)
    public String putNewAccommodation(AccommObject newAccom, LocationObject locationObj, ActivityObj checkInObj, ActivityObj checkOutObj){


        try{

            String replyAcc = accRepo.insertIntoAccommodationTable(newAccom);

            System.out.println("reply from inserted accommodation >>>> " + newAccom.toString() + ">>>>>>>> result: " + replyAcc );

            String replylocation = localRepo.insertLocationTable(locationObj);


            System.out.println("reply from inserted location >>>> " + locationObj.toString() + ">>>>>>>> result: " + replylocation);

            String replyActivityCheckIn = activityRepo.insertActivityTable(checkInObj);

            System.out.println("reply from inserted activity check in >>>> " + checkInObj.toString() + ">>>>>>>> result: " + replyActivityCheckIn);

            String replyActivityCheckOut = activityRepo.insertActivityTable(checkOutObj);

            System.out.println("reply from inserted activity check out >>>> " + checkOutObj.toString() + ">>>>>>>> result: " + replyActivityCheckOut);

            
            return "OK";


        } catch (Exception ex){


            return "Error:" + ex.getMessage();
        }







    }

    public Optional<AccommObject> getAccommObjectByAccId(String accommodation_id){

        Optional<AccommObject> accomm =  accRepo.getAccommObjByAcc_ID(accommodation_id);

        return accomm;



    }

    public List<AccommObject> getManyAccommByTripId(String tripId){

        List<AccommObject> acomms = new ArrayList<>();

        acomms = accRepo.getManyAccommDetailsByTripId(tripId);


        return acomms;
    }
    
}
