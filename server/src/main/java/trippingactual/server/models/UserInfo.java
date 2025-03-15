package trippingactual.server.models;

import java.sql.ResultSet;
import java.sql.SQLException;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;

public class UserInfo {
    private String user_id;
    private String user_name;
    private String user_email;
    private String firebase_uid;
    private String country_origin;
    private String timezone_origin;
    private String currency_origin;
    private boolean notif;

    public String getUser_id() {
        return user_id;
    }
    public void setUser_id(String user_id) {
        this.user_id = user_id;
    }
    public String getUser_name() {
        return user_name;
    }
    public void setUser_name(String user_name) {
        this.user_name = user_name;
    }
    public String getUser_email() {
        return user_email;
    }
    public void setUser_email(String user_email) {
        this.user_email = user_email;
    }
    public String getFirebase_uid() {
        return firebase_uid;
    }
    public void setFirebase_uid(String firebase_uid) {
        this.firebase_uid = firebase_uid;
    }
    public String getCountry_origin() {
        return country_origin;
    }
    public void setCountry_origin(String country_origin) {
        this.country_origin = country_origin;
    }
    public String getTimezone_origin() {
        return timezone_origin;
    }
    public void setTimezone_origin(String timezone_origin) {
        this.timezone_origin = timezone_origin;
    }
    public boolean isNotif() {
        return notif;
    }
    public void setNotif(boolean notif) {
        this.notif = notif;
    }

    public String getCurrency_origin() {
        return currency_origin;
    }
    public void setCurrency_origin(String currency_origin) {
        this.currency_origin = currency_origin;
    }


    

    
    @Override
    public String toString() {
        return "UserInfo [user_id=" + user_id + ", user_name=" + user_name + ", user_email=" + user_email
                + ", firebase_uid=" + firebase_uid + ", country_origin=" + country_origin + ", timezone_origin="
                + timezone_origin + ", currency_origin=" + currency_origin + ", notif=" + notif + "]";
    }

    public static UserInfo jsonToUserInfo(JsonObject jsonObject){

        UserInfo user = new UserInfo();


        if (jsonObject.containsKey("user_name")) {
            user.user_name = jsonObject.getString("user_name");
        } else {
            user.user_name = null;
        }


        if (jsonObject.containsKey("user_id")) {
            user.user_id = jsonObject.getString("user_id");
        } else {
            user.user_id = null;
        }

        if (jsonObject.containsKey("user_email")) {
            user.user_email = jsonObject.getString("user_email");
        } else {
            user.user_email = null;
        }

        if (jsonObject.containsKey("firebase_uid")) {
            user.firebase_uid = jsonObject.getString("firebase_uid");
        } else {
            user.firebase_uid = null;
        }

        if (jsonObject.containsKey("country_origin")) {
            user.country_origin = jsonObject.getString("country_origin");
        } else {
            user.country_origin = null;
        }


        if (jsonObject.containsKey("timezone_origin")) {
            user.timezone_origin = jsonObject.getString("timezone_origin");
        } else {
            user.timezone_origin = null;
        }

        if (jsonObject.containsKey("currency_origin")) {
            user.currency_origin = jsonObject.getString("currency_origin");
        } else {
            user.currency_origin = null;
        }


        if (jsonObject.containsKey("notif")) {
            user.notif = jsonObject.getBoolean("notif");
        } else {
            user.notif = true;
        }

        return user;
        

    }

    public static UserInfo populate(ResultSet rs) throws SQLException {
    UserInfo user = new UserInfo();

    user.setUser_id(rs.getString("user_id"));
    user.setUser_name(rs.getString("user_name"));
    user.setUser_email(rs.getString("user_email"));
    user.setFirebase_uid(rs.getString("firebase_uid"));
    user.setCountry_origin(rs.getString("country_origin"));
    user.setTimezone_origin(rs.getString("timezone_origin"));
    user.setCurrency_origin(rs.getString("currency_origin"));
    user.setNotif(rs.getBoolean("notif"));

    return user;
}


public JsonObject toJson() {
    JsonObjectBuilder builder = Json.createObjectBuilder();

    if (user_id != null) {
        builder.add("user_id", user_id);
    }
    if (user_name != null) {
        builder.add("user_name", user_name);
    }
    if (user_email != null) {
        builder.add("user_email", user_email);
    }
    if (firebase_uid != null) {
        builder.add("firebase_uid", firebase_uid);
    }
    if (country_origin != null) {
        builder.add("country_origin", country_origin);
    }
    if (timezone_origin != null) {
        builder.add("timezone_origin", timezone_origin);
    }
    if (currency_origin != null) {
        builder.add("currency_origin", currency_origin);
    }
    builder.add("notif", notif);  // 'notif' is always included since it's a boolean

    return builder.build();
}



}
