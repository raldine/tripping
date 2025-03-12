package trippingactual.server.queries;



public class SqlQueries {


    //for check user exists
    public final static String checkUserExist = "SELECT EXISTS (SELECT 1 FROM users WHERE user_email=?)";

    //for insert new user (initial)
    public final static String insertNewUser = "INSERT INTO users(firebase_uid, user_email) VALUES (?,?)";
    

    //for insert new user (further)
    public final static String updateMoreNewUserDetails = "UPDATE users SET user_name=?, country_origin=?, timezone_origin=?, currency_origin=?, notif=? WHERE user_email=?";


    //check if user exists in my database (authentication process)
    public final static String checkUserExistByFBIuid = "SELECT COUNT(*) FROM users WHERE firebase_uid = ?";


    //post sql user new/exist check - check if user have gone through further Registration phase
    public final static String checkUserPassFurtherRegistation= "SELECT COUNT(*) from users WHERE country_origin IS NULL and user_email=?";

}
