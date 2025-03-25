package trippingactual.server.models;

import java.io.StringReader;
import java.sql.ResultSet;
import java.sql.SQLException;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import jakarta.json.JsonReader;

public class UserRoles {

    private String trip_id;
    private String user_id;
    private String role;
    private String share_id;
    private String share_id_view_only;
    private String user_display_name;
    private String user_email;

    public String getUser_email() {
        return user_email;
    }

    public void setUser_email(String user_email) {
        this.user_email = user_email;
    }


    public String getTrip_id() {
        return trip_id;
    }

    public void setTrip_id(String trip_id) {
        this.trip_id = trip_id;
    }

    public String getUser_id() {
        return user_id;
    }

    public void setUser_id(String user_id) {
        this.user_id = user_id;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getShare_id() {
        return share_id;
    }

    public void setShare_id(String share_id) {
        this.share_id = share_id;
    }

    public String getShare_id_view_only() {
        return share_id_view_only;
    }

    public void setShare_id_view_only(String share_id_view_only) {
        this.share_id_view_only = share_id_view_only;
    }

    public String getUser_display_name() {
        return user_display_name;
    }

    public void setUser_display_name(String user_display_name) {
        this.user_display_name = user_display_name;
    }
    


    @Override
    public String toString() {
        return "UserRoles [trip_id=" + trip_id + ", user_id=" + user_id + ", role=" + role + ", share_id=" + share_id
                + ", share_id_view_only=" + share_id_view_only + ", user_display_name=" + user_display_name
                + ", user_email=" + user_email + "]";
    }

    public JsonObject toJson() {
        // Create a JsonObjectBuilder to build the JSON object
        JsonObjectBuilder builder = Json.createObjectBuilder();

        builder.add("trip_id", this.trip_id)
                .add("user_id", this.user_id)
                .add("role", this.role)
                .add("share_id", this.share_id)
                .add("share_id_view_only", this.share_id_view_only)
                .add("user_display_name", this.user_display_name)
                .add("user_email", this.user_email);

        // Build the JsonObject
        JsonObject jsonObject = builder.build();

        // Return the JSON object as a String
        return jsonObject;
    }

    public static UserRoles fromJsonToUsrRole(JsonObject userrolejson) {
        JsonReader jsonReader = Json.createReader(new StringReader(userrolejson.toString()));

        // Read the JsonObject from the string
        JsonObject jsonObject = jsonReader.readObject();

        // Create a new accomm object
        UserRoles userrole = new UserRoles();

        // Set properties from the JSON object
        userrole.setTrip_id(jsonObject.getString("trip_id"));
        userrole.setUser_id(jsonObject.getString("user_id"));
        userrole.setRole(jsonObject.getString("role"));
        userrole.setUser_display_name(jsonObject.getString("user_display_name"));
        userrole.setUser_email(jsonObject.getString("user_email"));
        // Use "N/A" if the key is missing or the value is null
        userrole.setShare_id(userrolejson.containsKey("share_id") && userrolejson.getString("share_id") != null
                ? userrolejson.getString("share_id")
                : "N/A");
        userrole.setShare_id_view_only(
                userrolejson.containsKey("share_id_view_only") && userrolejson.getString("share_id_view_only") != null
                        ? userrolejson.getString("share_id_view_only")
                        : "N/A");

        return userrole;
    }

    public static UserRoles populate(ResultSet rs) throws SQLException {
        UserRoles userRole = new UserRoles();

        userRole.setTrip_id(rs.getString("trip_id"));
        userRole.setUser_id(rs.getString("user_id"));
        userRole.setRole(rs.getString("role"));
        userRole.setUser_display_name(rs.getString("user_display_name"));
        userRole.setUser_email(rs.getString("user_email"));
        // Check for NULL values in the ResultSet
        userRole.setShare_id(rs.getString("share_id") != null ? rs.getString("share_id") : "N/A");
        userRole.setShare_id_view_only(
                rs.getString("share_id_view_only") != null ? rs.getString("share_id_view_only") : "N/A");

        return userRole;
    }




}
