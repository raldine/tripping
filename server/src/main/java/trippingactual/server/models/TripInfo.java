package trippingactual.server.models;

import java.io.StringReader;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import jakarta.json.JsonReader;

public class TripInfo {

    private String trip_id;
    private String trip_name;
    private Date start_date;
    private Date end_date;
    private String destination_city;
    private String destination_curr;
    private String destination_timezone;
    private String d_timezone_name;
    private String d_iso2;
    private String dest_lat;
    private String dest_lng;
    private String description_t;
    private String cover_image_id;
    private String attendees;
    private String master_user_id;
    private Timestamp last_updated;


    public String getD_iso2() {
        return d_iso2;
    }

    public void setD_iso2(String d_iso2) {
        this.d_iso2 = d_iso2;
    }

    
    public String getDest_lat() {
        return dest_lat;
    }

    public void setDest_lat(String dest_lat) {
        this.dest_lat = dest_lat;
    }

    public String getDest_lng() {
        return dest_lng;
    }

    public void setDest_lng(String dest_lng) {
        this.dest_lng = dest_lng;
    }

    public String getTrip_id() {
        return trip_id;
    }

    public void setTrip_id(String trip_id) {
        this.trip_id = trip_id;
    }

    public String getTrip_name() {
        return trip_name;
    }

    public void setTrip_name(String trip_name) {
        this.trip_name = trip_name;
    }

    public Date getStart_date() {
        return start_date;
    }

    public void setStart_date(Date start_date) {
        this.start_date = start_date;
    }

    public Date getEnd_date() {
        return end_date;
    }

    public void setEnd_date(Date end_date) {
        this.end_date = end_date;
    }

    public String getDestination_city() {
        return destination_city;
    }

    public void setDestination_city(String destination_city) {
        this.destination_city = destination_city;
    }

    public String getDestination_curr() {
        return destination_curr;
    }

    public void setDestination_curr(String destination_curr) {
        this.destination_curr = destination_curr;
    }

    public String getDescription_t() {
        return description_t;
    }

    public void setDescription_t(String description_t) {
        this.description_t = description_t;
    }

    public String getCover_image_id() {
        return cover_image_id;
    }

    public void setCover_image_id(String cover_image_id) {
        this.cover_image_id = cover_image_id;
    }

    public String getAttendees() {
        return attendees;
    }

    public void setAttendees(String attendees) {
        this.attendees = attendees;
    }

    public String getMaster_user_id() {
        return master_user_id;
    }

    public void setMaster_user_id(String master_user_id) {
        this.master_user_id = master_user_id;
    }

    public Timestamp getLast_updated() {
        return last_updated;
    }

    public void setLast_updated(Timestamp last_updated) {
        this.last_updated = last_updated;
    }

    public String getDestination_timezone() {
        return destination_timezone;
    }

    public void setDestination_timezone(String destination_timezone) {
        this.destination_timezone = destination_timezone;
    }

    public String getD_timezone_name() {
        return d_timezone_name;
    }

    public void setD_timezone_name(String d_timezone_name) {
        this.d_timezone_name = d_timezone_name;
    }

    public JsonObject toJson() {
        // Create a JsonObjectBuilder to build the JSON object
        JsonObjectBuilder builder = Json.createObjectBuilder();

        // Add properties to the JSON object
        builder.add("trip_id", this.trip_id)
                .add("trip_name", this.trip_name)
                .add("start_date", dateUtilToString(this.start_date))// Convert Date to String
                .add("end_date", dateUtilToString(this.end_date)) // Convert Date to String
                .add("destination_city", this.destination_city)
                .add("destination_curr", this.destination_curr)
                .add("destination_timezone", this.destination_timezone)
                .add("d_timezone_name", this.d_timezone_name)
                .add("d_iso2", this.d_iso2)
                .add("dest_lat", this.dest_lat)
                .add("dest_lng", this.dest_lng)
                .add("description_t", this.description_t)
                .add("cover_image_id", this.cover_image_id)
                .add("attendees", this.attendees)
                .add("master_user_id", this.master_user_id)
                .add("last_updated", this.last_updated.toString());

        // Build the JsonObject
        JsonObject jsonObject = builder.build();

        // Return the JSON object as a String
        return jsonObject;
    }

    public static TripInfo fromJsonToTripInfo(JsonObject tripInfoInJson) {
        // Create a JsonReader from the string input
        JsonReader jsonReader = Json.createReader(new StringReader(tripInfoInJson.toString()));

        // Read the JsonObject from the string
        JsonObject jsonObject = jsonReader.readObject();

        // Create a new TripInfo object
        TripInfo tripInfo = new TripInfo();

        // Set properties from the JSON object
        tripInfo.setTrip_id(jsonObject.getString("trip_id"));
        tripInfo.setTrip_name(jsonObject.getString("trip_name"));
        tripInfo.setStart_date(parseDate(jsonObject.getString("start_date"))); // Convert String to Date
        tripInfo.setEnd_date(parseDate(jsonObject.getString("end_date"))); // Convert String to Date
        tripInfo.setDestination_city(jsonObject.getString("destination_city"));
        tripInfo.setDestination_curr(jsonObject.getString("destination_curr"));
        tripInfo.setDestination_timezone(jsonObject.getString("destination_timezone"));
        tripInfo.setD_timezone_name(jsonObject.getString("d_timezone_name"));
        tripInfo.setD_iso2(jsonObject.getString("d_iso2"));
        tripInfo.setDest_lat(jsonObject.getString("dest_lat"));
        tripInfo.setDest_lng(jsonObject.getString("dest_lng"));
        tripInfo.setDescription_t(jsonObject.getString("description_t"));
        tripInfo.setCover_image_id(jsonObject.getString("cover_image_id"));
        tripInfo.setAttendees(jsonObject.getString("attendees"));
        tripInfo.setMaster_user_id(jsonObject.getString("master_user_id"));
        tripInfo.setLast_updated(null);

        return tripInfo;
    }

    public static TripInfo populate(ResultSet rs) throws SQLException {
        TripInfo trips = new TripInfo();

        trips.setTrip_id(rs.getString("trip_id"));
        trips.setTrip_name(rs.getString("trip_name"));
        trips.setStart_date(parseDate(rs.getString("start_date"))); // Convert String to Date
        trips.setEnd_date(parseDate(rs.getString("end_date"))); // Convert String to Date
        trips.setDestination_city(rs.getString("destination_city"));
        trips.setDestination_curr(rs.getString("destination_curr"));
        trips.setDestination_timezone(rs.getString("destination_timezone"));
        trips.setD_timezone_name(rs.getString("d_timezone_name"));
        trips.setD_iso2(rs.getString("d_iso2"));
        trips.setDest_lat(rs.getString("dest_lat"));
        trips.setDest_lng(rs.getString("dest_lng"));
        trips.setDescription_t(rs.getString("description_t"));
        trips.setCover_image_id(rs.getString("cover_image_id"));
        trips.setAttendees(rs.getString("attendees"));
        trips.setMaster_user_id(rs.getString("master_user_id"));
        trips.setLast_updated(rs.getTimestamp("last_updated"));

        return trips;
    }

    public static Date parseDate(String date) {
        try {
            return new SimpleDateFormat("yyyy-MM-dd").parse(date);

        } catch (ParseException e) {
            return null;
        }
    }

    public static String dateUtilToString(Date date){
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");

        return formatter.format(date);
    }


}
