package trippingactual.server.models;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Date;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;

public class ActivityObj {

    private String activity_id;
    private String trip_id;
    private String itinerary_id;
    private String event_name;
    private String activity_type;
    private Date start_date;
    private String start_time;
    private Date end_date;
    private String end_time;
    private String timezone_time;
    private String event_notes;
    private String location_id;
    private String last_updated_by;
    private Timestamp last_updated;
    public String getActivity_id() {
        return activity_id;
    }
    public void setActivity_id(String activity_id) {
        this.activity_id = activity_id;
    }
    public String getTrip_id() {
        return trip_id;
    }
    public void setTrip_id(String trip_id) {
        this.trip_id = trip_id;
    }
    public String getItinerary_id() {
        return itinerary_id;
    }
    public void setItinerary_id(String itinerary_id) {
        this.itinerary_id = itinerary_id;
    }
    public String getEvent_name() {
        return event_name;
    }
    public void setEvent_name(String event_name) {
        this.event_name = event_name;
    }
    public String getActivity_type() {
        return activity_type;
    }
    public void setActivity_type(String activity_type) {
        this.activity_type = activity_type;
    }
    public Date getStart_date() {
        return start_date;
    }
    public void setStart_date(Date start_date) {
        this.start_date = start_date;
    }
    public String getStart_time() {
        return start_time;
    }
    public void setStart_time(String start_time) {
        this.start_time = start_time;
    }
    public Date getEnd_date() {
        return end_date;
    }
    public void setEnd_date(Date end_date) {
        this.end_date = end_date;
    }
    public String getEnd_time() {
        return end_time;
    }
    public void setEnd_time(String end_time) {
        this.end_time = end_time;
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
    public String getLocation_id() {
        return location_id;
    }
    public void setLocation_id(String location_id) {
        this.location_id = location_id;
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

        // Convert ActivityObj to JSON
    public JsonObject toJson() {
        JsonObjectBuilder builder = Json.createObjectBuilder();

        builder.add("activity_id", this.activity_id)
               .add("trip_id", this.trip_id)
               .add("itinerary_id", this.itinerary_id)
               .add("event_name", this.event_name)
               .add("activity_type", this.activity_type)
               .add("start_date", TripInfo.dateUtilToString(this.start_date)) // Convert Date to String
               .add("start_time", this.start_time)
               .add("end_date", TripInfo.dateUtilToString(this.end_date)) // Convert Date to String
               .add("end_time", this.end_time)
               .add("timezone_time", this.timezone_time)
               .add("event_notes", this.event_notes)
               .add("location_id", this.location_id)
               .add("last_updated_by", this.last_updated_by)
               .add("last_updated", this.last_updated != null ? this.last_updated.toString() : null);

        return builder.build();
    }

    // Convert JSON to ActivityObj
    public static ActivityObj fromJsonToActivityObj(JsonObject activityJsonObject) {
        ActivityObj activity = new ActivityObj();

        activity.setActivity_id(activityJsonObject.getString("activity_id"));
        activity.setTrip_id(activityJsonObject.getString("trip_id"));
        activity.setItinerary_id(activityJsonObject.getString("itinerary_id"));
        activity.setEvent_name(activityJsonObject.getString("event_name"));
        activity.setActivity_type(activityJsonObject.getString("activity_type"));
        activity.setStart_date(TripInfo.parseDate(activityJsonObject.getString("start_date")));
        activity.setStart_time(activityJsonObject.getString("start_time"));
        activity.setEnd_date(TripInfo.parseDate(activityJsonObject.getString("end_date")));
        activity.setEnd_time(activityJsonObject.getString("end_time"));
        activity.setTimezone_time(activityJsonObject.getString("timezone_time"));
        activity.setEvent_notes(activityJsonObject.getString("event_notes"));
        activity.setLocation_id(activityJsonObject.getString("location_id"));
        activity.setLast_updated_by(activityJsonObject.getString("last_updated_by"));
        // If last_updated is present in JSON, set it. If not, set null
        if (activityJsonObject.containsKey("last_updated")) {
            activity.setLast_updated(Timestamp.valueOf(activityJsonObject.getString("last_updated")));
        } else {
            activity.setLast_updated(null);
        }

        return activity;
    }

     // Populate ActivityObj from ResultSet (Database)
    public static ActivityObj populate(ResultSet rs) throws SQLException {
        ActivityObj activityObj = new ActivityObj();

        activityObj.setActivity_id(rs.getString("activity_id"));
        activityObj.setTrip_id(rs.getString("trip_id"));
        activityObj.setItinerary_id(rs.getString("itinerary_id"));
        activityObj.setEvent_name(rs.getString("event_name"));
        activityObj.setActivity_type(rs.getString("activity_type"));
        activityObj.setStart_date(TripInfo.parseDate(rs.getString("start_date")));
        activityObj.setStart_time(rs.getString("start_time"));
        activityObj.setEnd_date(TripInfo.parseDate(rs.getString("end_date")));
        activityObj.setEnd_time(rs.getString("end_time"));
        activityObj.setTimezone_time(rs.getString("timezone_time"));
        activityObj.setEvent_notes(rs.getString("event_notes"));
        activityObj.setLocation_id(rs.getString("location_id"));
        activityObj.setLast_updated_by(rs.getString("last_updated_by"));
        activityObj.setLast_updated(rs.getTimestamp("last_updated"));

        return activityObj;
    }
    
    @Override
    public String toString() {
        return "ActivityObj [activity_id=" + activity_id + ", trip_id=" + trip_id + ", itinerary_id=" + itinerary_id
                + ", event_name=" + event_name + ", activity_type=" + activity_type + ", start_date=" + start_date
                + ", start_time=" + start_time + ", end_date=" + end_date + ", end_time=" + end_time
                + ", timezone_time=" + timezone_time + ", event_notes=" + event_notes + ", location_id=" + location_id
                + ", last_updated_by=" + last_updated_by + ", last_updated=" + last_updated + "]";
    }

    

    
    
}
