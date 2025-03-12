package trippingactual.server.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.json.JsonObject;
import trippingactual.server.models.UserInfo;
import trippingactual.server.repositories.UserRepo;

@Service
public class UserService {

    //create service to check if user exists, else insert new user

    @Autowired
    private UserRepo userRepo;

    public String checkIfUserExistElseInsert(String firebaseUid, String email){

        String replyFromRepo = userRepo.checkIfUserExistElseInsert(firebaseUid, email);

        return replyFromRepo;


    }


    public String checkIfUserExistsAuthen(String firebaseUid){

        String replyFromRepo = userRepo.checkIfUserExistsAuthen(firebaseUid);

        return replyFromRepo;

    }

    public String furtherRegisterUser(JsonObject userInfo){

        UserInfo newUser = UserInfo.jsonToUserInfo(userInfo);


        String replyFromRepo = userRepo.furtherRegisterUser(newUser);

        return replyFromRepo;
        
    }

    public String checkIfUserPassFurtherReg(String email){


        String replyFromRepo = userRepo.checkIfUserPassFurtherReg(email);

        return replyFromRepo;
    }
    
}
