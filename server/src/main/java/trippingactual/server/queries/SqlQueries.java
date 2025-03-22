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

    public final static String getUserInfoByFirebaseUid = "SELECT * from users where firebase_uid=?";


    //TRIP DETALS
    //put new trip
    public final static String putNewTrip = "INSERT INTO trips(trip_id, trip_name, start_date, end_date, destination_city, destination_curr, destination_timezone, d_timezone_name, d_iso2, dest_lat, dest_lng, description_t, cover_image_id, attendees, master_user_id) VALUES (?, ?, ?, ?, ?, ? ,?, ?, ?, ?, ?, ?, ?, ?, ?)";




    //USER UPLOADED RESOURCES


}
