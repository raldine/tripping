package trippingactual.server.models;

import java.io.StringReader;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Arrays;

import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import jakarta.json.JsonReader;

public class LocationObject {


    private String location_id;
    private String location_lat;
    private String location_lng;
    private String location_address;
    private String location_name;
    private String google_place_id;
    private String g_biz_number;
    private String g_biz_website;
    private String[] g_opening_hrs;
    private String trip_id;
    private String itinerary_id;
    private Timestamp last_updated;
    public String getLocation_id() {
        return location_id;
    }
    public void setLocation_id(String location_id) {
        this.location_id = location_id;
    }
    public String getLocation_lat() {
        return location_lat;
    }
    public void setLocation_lat(String location_lat) {
        this.location_lat = location_lat;
    }
    public String getLocation_lng() {
        return location_lng;
    }
    public void setLocation_lng(String location_lng) {
        this.location_lng = location_lng;
    }
    public String getLocation_address() {
        return location_address;
    }
    public void setLocation_address(String location_address) {
        this.location_address = location_address;
    }
    public String getLocation_name() {
        return location_name;
    }
    public void setLocation_name(String location_name) {
        this.location_name = location_name;
    }
    public String getGoogle_place_id() {
        return google_place_id;
    }
    public void setGoogle_place_id(String google_place_id) {
        this.google_place_id = google_place_id;
    }
    public String getG_biz_number() {
        return g_biz_number;
    }
    public void setG_biz_number(String g_biz_number) {
        this.g_biz_number = g_biz_number;
    }
    public String getG_biz_website() {
        return g_biz_website;
    }
    public void setG_biz_website(String g_biz_website) {
        this.g_biz_website = g_biz_website;
    }
    public String[] getG_opening_hrs() {
        return g_opening_hrs;
    }
    public void setG_opening_hrs(String[] g_opening_hrs) {
        this.g_opening_hrs = g_opening_hrs;
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
    public Timestamp getLast_updated() {
        return last_updated;
    }
    public void setLast_updated(Timestamp last_updated) {
        this.last_updated = last_updated;
    }

    public JsonObject toJson() {
        // Create a JsonObjectBuilder to build the JSON object
        JsonObjectBuilder builder = Json.createObjectBuilder();
        JsonArrayBuilder opening_hours_building = Json.createArrayBuilder();

        if(this.g_opening_hrs.length!=0){

            for(int i=0; i < this.g_opening_hrs.length; i++){
                opening_hours_building.add(this.g_opening_hrs[i]);
            }

        } else {
            opening_hours_building.add("N/A");
        }

        JsonArray opening_hours_built = opening_hours_building.build();
      

        // Add properties to the JSON object
        builder.add("location_id", this.location_id)
                .add("location_lat", this.location_lat)
                .add("location_lng", this.location_lng)
                .add("location_address", this.location_address)
                .add("location_name", this.location_name) 
                .add("google_place_id", this.google_place_id)
                .add("g_biz_number", this.g_biz_number)
                .add("g_biz_website", this.g_biz_website)
                .add("g_opening_hrs", opening_hours_built)
                .add("trip_id", this.trip_id)
                .add("itinerary_id", this.itinerary_id)
                .add("last_updated", this.last_updated.toString());
        

        // Build the JsonObject
        JsonObject jsonObject = builder.build();

        // Return the JSON object as a String
        return jsonObject;
    }

    public static LocationObject fromJsonToLocationObject(JsonObject locationJsonObject) {
        // Create a JsonReader from the string input
        JsonReader jsonReader = Json.createReader(new StringReader(locationJsonObject.toString()));

        // Read the JsonObject from the string
        JsonObject jsonObject = jsonReader.readObject();

        // Create a new accomm object
        LocationObject locationInfo = new LocationObject();

        JsonArray g_opening_hours = jsonObject.getJsonArray("g_opening_hrs");
        String[] operating_hours = new String[g_opening_hours.size()];
        for(int i =0; i < g_opening_hours.size(); i++){
            operating_hours[i] = g_opening_hours.getString(i);
        }

        // Set properties from the JSON object
        locationInfo.setLocation_id(jsonObject.getString("location_id"));
        locationInfo.setLocation_lat(jsonObject.getString("location_lat"));
        locationInfo.setLocation_lng(jsonObject.getString("location_lng"));
        locationInfo.setLocation_address(jsonObject.getString("location_address"));
        locationInfo.setLocation_name(jsonObject.getString("location_name"));
        locationInfo.setGoogle_place_id(jsonObject.getString("google_place_id"));
        locationInfo.setG_biz_number(jsonObject.getString("g_biz_number"));
        locationInfo.setG_biz_website(jsonObject.getString("g_biz_website"));
        locationInfo.setG_opening_hrs(operating_hours);
        locationInfo.setTrip_id(jsonObject.getString("trip_id")); 
        locationInfo.setItinerary_id(jsonObject.getString("itinerary_id"));
        locationInfo.setLast_updated(null);

        return locationInfo;
    }

    public static LocationObject populate(ResultSet rs) throws SQLException {
        LocationObject localObj = new LocationObject();

        String[] tempArray;
        if(!rs.getString("g_opening_hrs").equals(new String[] {""})){
            tempArray = rs.getString("g_opening_hrs").split(",");
        } else {
            tempArray = new String[1];
            tempArray[0] = "N/A";
        }
        localObj.setLocation_id(rs.getString("location_id"));
        localObj.setLocation_lat(rs.getString("location_lat"));
        localObj.setLocation_lng(rs.getString("location_lng"));
        localObj.setLocation_address(rs.getString("location_address"));
        localObj.setLocation_name(rs.getString("location_name")); 
        localObj.setGoogle_place_id(rs.getString("google_place_id"));
        localObj.setG_biz_number(rs.getString("g_biz_number")); 
        localObj.setG_biz_website(rs.getString("g_biz_website"));// Convert Time to String
        localObj.setG_opening_hrs(tempArray);
        localObj.setTrip_id(rs.getString("trip_id"));
        localObj.setItinerary_id("itinerary_id");
        localObj.setLast_updated(rs.getTimestamp("last_updated"));

        return localObj;
    }

    @Override
    public String toString() {
        return "LocationObject [location_id=" + location_id + ", location_lat=" + location_lat + ", location_lng="
                + location_lng + ", location_address=" + location_address + ", location_name=" + location_name
                + ", google_place_id=" + google_place_id + ", g_biz_number=" + g_biz_number + ", g_biz_website="
                + g_biz_website + ", g_opening_hrs=" + Arrays.toString(g_opening_hrs) + ", trip_id=" + trip_id
                + ", itinerary_id=" + itinerary_id + ", last_updated=" + last_updated + "]";
    }

    
    
}
