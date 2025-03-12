package trippingactual.server.repositories;

import java.sql.SQLException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

// import com.google.gson.JsonObject;

import trippingactual.server.models.UserInfo;
import trippingactual.server.queries.SqlQueries;

@Repository
public class UserRepo {

    @Autowired
    private JdbcTemplate sqltemplate;

    public String checkIfUserExistElseInsert(String firebaseUid, String email) {

        try {

            boolean countIfExist = sqltemplate.queryForObject(SqlQueries.checkUserExist, boolean.class, email);

            if (countIfExist==false) {
                System.out.println("detected new user under " + email);

                int successUpdate = sqltemplate.update(SqlQueries.insertNewUser, firebaseUid, email);

                if (successUpdate > 0) {
                    System.out.println("success register new user " + firebaseUid + " and " + email);
                    return "new registered";
                } else {
                    System.out.println("unable to register user");
                    return "new failed register";
                }
            } else {
                System.out.println("existing user detected");
                return "exists";
            }

        } catch (DataAccessException ex) {
            ex.printStackTrace();

            return "failed check exist";
        }

    }

    public String checkIfUserExistsAuthen(String firebaseUid) {
        // as whicher ever user exists is already authenticated on firebase end, any
        // reocrd that matches in sql means its a valid user

        try {

            int count = sqltemplate.queryForObject(SqlQueries.checkUserExistByFBIuid, Integer.class, firebaseUid);

            if (count > 0) {
                return "valid";
            } else {
                return "invalid";
            }

        } catch (DataAccessException ex) {
            ex.printStackTrace();
        }
        return null;

    }

    public String furtherRegisterUser(UserInfo userInfo) {

        try {

            // public final static String updateMoreNewUserDetails = "UPDATE users SET
            // user_name=?, country_origin=?, timezone_origin=?, notif=? WHERE
            // user_email=?";

            int count = sqltemplate.update(SqlQueries.updateMoreNewUserDetails, userInfo.getUser_name(),
                    userInfo.getCountry_origin(), userInfo.getTimezone_origin(), userInfo.getCurrency_origin(), userInfo.isNotif(),
                    userInfo.getUser_email());

            if (count > 0) {
                return "OK";
            } else {
                return "error";
            }

        } catch (DataAccessException ex) {
            ex.printStackTrace();
        }
        return null;
    }


    public String checkIfUserPassFurtherReg(String email){

        try {

     
            int count = sqltemplate.queryForObject(SqlQueries.checkUserPassFurtherRegistation, Integer.class, email);

            if (count > 0) {
                return "failed";
            } else {
                return "passed";
            }

        } catch (DataAccessException ex) {
            ex.printStackTrace();
        }
        return null;


    }

}
