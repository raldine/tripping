package trippingactual.server.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import trippingactual.server.models.UserRoles;
import trippingactual.server.repositories.UserRolesRepo;

@Service
public class UserROLESService {

    @Autowired
    private UserRolesRepo userRolesRepo;

    public String initNewUserRoleForTrip(UserRoles userRole){
        

        String replyfromRepo = userRolesRepo.initNewUserRoleForTrip(userRole);

        return replyfromRepo;
    }


    public String registerUserRoleEditorInExistingTrip(UserRoles newUserRole){

        String replyfromRepo = userRolesRepo.registerUserRoleEditorInExistingTrip(newUserRole);

        return replyfromRepo;
    }

    public String registerUserRoleVIEWONLYInExistingTrip(UserRoles newUserRole){
        String replyfromRepo = userRolesRepo.registerUserRoleVIEWONLYInExistingTrip(newUserRole);

        return replyfromRepo;
    }

    public String getUsersRoleForParticularTrip(String user_id, String trip_id){
        String replyFromRepo = userRolesRepo.getUsersRoleForParticularTrip(user_id, trip_id);

        return replyFromRepo;
    }

    public String getShareIDForTrip(String trip_id, String user_id){

        String replyFromRepo = userRolesRepo.getShareIDForTrip(user_id, trip_id);

        return replyFromRepo;
    }

    public String getShareIDVIEWONLYForTrip(String trip_id, String user_id){
        String replyFromRepo = userRolesRepo.getShareIDVIEWONLYForTrip(user_id, trip_id);


        return replyFromRepo;


    }

    public List<UserRoles> getALLUSERSROLESFORATRIP(String trip_id){

        List<UserRoles> user = userRolesRepo.getALLUSERSROLESFORATRIP(trip_id);


        return user;
        
    }
    
}
