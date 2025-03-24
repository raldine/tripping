package trippingactual.server.models;

import java.io.StringReader;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Date;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import jakarta.json.JsonReader;

public class AccommObject {

    private String accommodation_id;
    private String accommodation_name;
    private String trip_id;
    private Date check_in_date;
    private String check_in_time;
    private Date check_out_date;
    private String check_out_time;
    private String timezone_time;
    private String event_notes;
    private String location_id;
    private String last_updated_by;
    private Timestamp last_updated;
    public String getAccommodation_id() {
        return accommodation_id;
    }
    public void setAccommodation_id(String accommodation_id) {
        this.accommodation_id = accommodation_id;
    }
    public String getAccommodation_name() {
        return accommodation_name;
    }
    public void setAccommodation_name(String accommodation_name) {
        this.accommodation_name = accommodation_name;
    }
    public String getTrip_id() {
        return trip_id;
    }
    public void setTrip_id(String trip_id) {
        this.trip_id = trip_id;
    }
    public Date getCheck_in_date() {
        return check_in_date;
    }
    public void setCheck_in_date(Date check_in_date) {
        this.check_in_date = check_in_date;
    }
    public String getCheck_in_time() {
        return check_in_time;
    }
    public void setCheck_in_time(String check_in_time) {
        this.check_in_time = check_in_time;
    }
    public Date getCheck_out_date() {
        return check_out_date;
    }
    public void setCheck_out_date(Date check_out_date) {
        this.check_out_date = check_out_date;
    }
    public String getCheck_out_time() {
        return check_out_time;
    }
    public void setCheck_out_time(String check_out_time) {
        this.check_out_time = check_out_time;
    }
    public String getTimezone_time() {
        return timezone_time;
    }
    public void setTimezone_time(String timezone_time) {
        this.timezone_time = timezone_time;
    }
    public String getEvent_notes() {
        return event_notes;
    }
    public void setEvent_notes(String event_notes) {
        this.event_notes = event_notes;
    }
    public String getLast_updated_by() {
        return last_updated_by;
    }
    public void setLast_updated_by(String last_updated_by) {
        this.last_updated_by = last_updated_by;
    }
    public Timestamp getLast_updated() {
        return last_updated;
    }
    public void setLast_updated(Timestamp last_updated) {
        this.last_updated = last_updated;
    }

    public String getLocation_id() {
        return location_id;
    }
    public void setLocation_id(String location_id) {
        this.location_id = location_id;
    }
        

public JsonObject toJson() {
        // Create a JsonObjectBuilder to build the JSON object
        JsonObjectBuilder builder = Json.createObjectBuilder();

        // Add properties to the JSON object
        builder.add("accommodation_id", this.accommodation_id)
                .add("accommodation_name", this.accommodation_name)
                .add("trip_id", this.trip_id)
                .add("check_in_date", TripInfo.dateUtilToString(this.check_in_date))// Convert Date to String
                .add("check_in_time", this.check_in_time)
                .add("check_out_date", TripInfo.dateUtilToString(this.check_out_date)) // Convert Date to String
                .add("check_out_time", this.check_out_time)
                .add("timezone_time", this.timezone_time)
                .add("event_notes", this.event_notes)
                .add("location_id", this.location_id)
                .add("last_updated_by", this.last_updated_by)
                .add("last_updated", this.last_updated.toString());
        

        // Build the JsonObject
        JsonObject jsonObject = builder.build();

        // Return the JSON object as a String
        return jsonObject;
    }

    
    
    
    @Override
public String toString() {
    return "AccommObject [accommodation_id=" + accommodation_id + ", accommodation_name=" + accommodation_name
            + ", trip_id=" + trip_id + ", check_in_date=" + check_in_date + ", check_in_time=" + check_in_time
            + ", check_out_date=" + check_out_date + ", check_out_time=" + check_out_time + ", timezone_time="
            + timezone_time + ", event_notes=" + event_notes + ", location_id=" + location_id + ", last_updated_by="
            + last_updated_by + ", last_updated=" + last_updated + "]";
}
    public static AccommObject fromJsonToAccommObject(JsonObject accomJsonObject) {
        // Create a JsonReader from the string input
        JsonReader jsonReader = Json.createReader(new StringReader(accomJsonObject.toString()));

        // Read the JsonObject from the string
        JsonObject jsonObject = jsonReader.readObject();

        // Create a new accomm object
        AccommObject accInfo = new AccommObject();

        // Set properties from the JSON object
        accInfo.setAccommodation_id(jsonObject.getString("accommodation_id"));
        accInfo.setAccommodation_name(jsonObject.getString("accommodation_name"));
        accInfo.setTrip_id(jsonObject.getString("trip_id")); // Convert String to Date
        accInfo.setCheck_in_date(TripInfo.parseDate(jsonObject.getString("check_in_date"))); // Convert String to Date
        accInfo.setCheck_in_time(jsonObject.getString("check_in_time"));
        accInfo.setCheck_out_date(TripInfo.parseDate(jsonObject.getString("check_out_date"))); // Convert String to Date
        accInfo.setCheck_out_time(jsonObject.getString("check_out_time"));
        accInfo.setTimezone_time(jsonObject.getString("timezone_time"));
        accInfo.setEvent_notes(jsonObject.getString("event_notes"));
        accInfo.setLocation_id(jsonObject.getString("location_id"));
        accInfo.setLast_updated_by(jsonObject.getString("last_updated_by"));
        accInfo.setLast_updated(null);

        return accInfo;
    }

     public static AccommObject populate(ResultSet rs) throws SQLException {
        AccommObject accommObj = new AccommObject();

        accommObj.setAccommodation_id(rs.getString("accommodation_id"));
        accommObj.setAccommodation_name(rs.getString("accommodation_name"));
        accommObj.setTrip_id(rs.getString("trip_id"));
        accommObj.setCheck_in_date(TripInfo.parseDate(rs.getString("check_in_date"))); 
        accommObj.setCheck_in_time(rs.getTime("check_in_time").toString());// Convert Time to String
        accommObj.setCheck_out_date(TripInfo.parseDate(rs.getString("check_out_date"))); 
        accommObj.setCheck_out_time(rs.getTime("check_out_time").toString());// Convert Time to String
        accommObj.setTimezone_time(rs.getString("timezone_time"));
        accommObj.setEvent_notes(rs.getString("event_notes"));
        accommObj.setLocation_id(rs.getString("location_id"));
        accommObj.setLast_updated_by(rs.getString("last_updated_by"));
        accommObj.setLast_updated(rs.getTimestamp("last_updated"));

        return accommObj;
    }

    

}
