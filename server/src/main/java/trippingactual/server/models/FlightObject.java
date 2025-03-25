package trippingactual.server.models;

import java.sql.ResultSet;
import java.sql.SQLException;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;

public class FlightObject {

    private String flight_id;
    private String trip_id;
    private String d_airline;
    private String d_flight_no;
    private String d_airport;
    private String d_airport_address;
    private String d_terminal;
    private String d_gate;
    private String d_checkin_time;
    private String d_departure_time;
    private String r_airline;
    private String r_flight_no;
    private String r_airport;
    private String r_airport_address;
    private String r_terminal;
    private String r_gate;
    private String r_checkin_time;
    private String r_departure_time;
    public String getFlight_id() {
        return flight_id;
    }
    public void setFlight_id(String flight_id) {
        this.flight_id = flight_id;
    }
    public String getTrip_id() {
        return trip_id;
    }
    public void setTrip_id(String trip_id) {
        this.trip_id = trip_id;
    }
    public String getD_airline() {
        return d_airline;
    }
    public void setD_airline(String d_airline) {
        this.d_airline = d_airline;
    }
    public String getD_flight_no() {
        return d_flight_no;
    }
    public void setD_flight_no(String d_flight_no) {
        this.d_flight_no = d_flight_no;
    }
    public String getD_airport() {
        return d_airport;
    }
    public void setD_airport(String d_airport) {
        this.d_airport = d_airport;
    }
    public String getD_airport_address() {
        return d_airport_address;
    }
    public void setD_airport_address(String d_airport_address) {
        this.d_airport_address = d_airport_address;
    }
    public String getD_terminal() {
        return d_terminal;
    }
    public void setD_terminal(String d_terminal) {
        this.d_terminal = d_terminal;
    }
    public String getD_gate() {
        return d_gate;
    }
    public void setD_gate(String d_gate) {
        this.d_gate = d_gate;
    }
    public String getD_checkin_time() {
        return d_checkin_time;
    }
    public void setD_checkin_time(String d_checkin_time) {
        this.d_checkin_time = d_checkin_time;
    }
    public String getD_departure_time() {
        return d_departure_time;
    }
    public void setD_departure_time(String d_departure_time) {
        this.d_departure_time = d_departure_time;
    }
    public String getR_airline() {
        return r_airline;
    }
    public void setR_airline(String r_airline) {
        this.r_airline = r_airline;
    }
    public String getR_flight_no() {
        return r_flight_no;
    }
    public void setR_flight_no(String r_flight_no) {
        this.r_flight_no = r_flight_no;
    }
    public String getR_airport() {
        return r_airport;
    }
    public void setR_airport(String r_airport) {
        this.r_airport = r_airport;
    }
    public String getR_airport_address() {
        return r_airport_address;
    }
    public void setR_airport_address(String r_airport_address) {
        this.r_airport_address = r_airport_address;
    }
    public String getR_terminal() {
        return r_terminal;
    }
    public void setR_terminal(String r_terminal) {
        this.r_terminal = r_terminal;
    }
    public String getR_gate() {
        return r_gate;
    }
    public void setR_gate(String r_gate) {
        this.r_gate = r_gate;
    }
    public String getR_checkin_time() {
        return r_checkin_time;
    }
    public void setR_checkin_time(String r_checkin_time) {
        this.r_checkin_time = r_checkin_time;
    }
    public String getR_departure_time() {
        return r_departure_time;
    }
    public void setR_departure_time(String r_departure_time) {
        this.r_departure_time = r_departure_time;
    }

    public JsonObject toJson() {
        JsonObjectBuilder builder = Json.createObjectBuilder();
        builder.add("flight_id", flight_id)
                .add("trip_id", trip_id)
                .add("d_airline", d_airline)
                .add("d_flight_no", d_flight_no)
                .add("d_airport", d_airport)
                .add("d_airport_address", d_airport_address)
                .add("d_terminal", d_terminal)
                .add("d_gate", d_gate)
                .add("d_checkin_time", d_checkin_time)
                .add("d_departure_time", d_departure_time)
                .add("r_airline", r_airline)
                .add("r_flight_no", r_flight_no)
                .add("r_airport", r_airport)
                .add("r_airport_address", r_airport_address)
                .add("r_terminal", r_terminal)
                .add("r_gate", r_gate)
                .add("r_checkin_time", r_checkin_time)
                .add("r_departure_time", r_departure_time);
        return builder.build();
    }

     public static FlightObject populate(ResultSet rs) throws SQLException {
        FlightObject flight = new FlightObject();
        flight.setFlight_id(rs.getString("flight_id"));
        flight.setTrip_id(rs.getString("trip_id"));
        flight.setD_airline(rs.getString("d_airline"));
        flight.setD_flight_no(rs.getString("d_flight_no"));
        flight.setD_airport(rs.getString("d_airport"));
        flight.setD_airport_address(rs.getString("d_airport_address"));
        flight.setD_terminal(rs.getString("d_terminal"));
        flight.setD_gate(rs.getString("d_gate"));
        flight.setD_checkin_time(rs.getString("d_checkin_time"));
        flight.setD_departure_time(rs.getString("d_departure_time"));
        flight.setR_airline(rs.getString("r_airline"));
        flight.setR_flight_no(rs.getString("r_flight_no"));
        flight.setR_airport(rs.getString("r_airport"));
        flight.setR_airport_address(rs.getString("r_airport_address"));
        flight.setR_terminal(rs.getString("r_terminal"));
        flight.setR_gate(rs.getString("r_gate"));
        flight.setR_checkin_time(rs.getString("r_checkin_time"));
        flight.setR_departure_time(rs.getString("r_departure_time"));
        return flight;
    }

    public static FlightObject fromJson(JsonObject json) {
        FlightObject flight = new FlightObject();
        flight.setFlight_id(json.getString("flight_id", "N/A"));
        flight.setTrip_id(json.getString("trip_id", "N/A"));
        flight.setD_airline(json.getString("d_airline", "N/A"));
        flight.setD_flight_no(json.getString("d_flight_no", "N/A"));
        flight.setD_airport(json.getString("d_airport", "N/A"));
        flight.setD_airport_address(json.getString("d_airport_address", "N/A"));
        flight.setD_terminal(json.getString("d_terminal", "N/A"));
        flight.setD_gate(json.getString("d_gate", "N/A"));
        flight.setD_checkin_time(json.getString("d_checkin_time", "N/A"));
        flight.setD_departure_time(json.getString("d_departure_time", "N/A"));
        flight.setR_airline(json.getString("r_airline", "N/A"));
        flight.setR_flight_no(json.getString("r_flight_no", "N/A"));
        flight.setR_airport(json.getString("r_airport", "N/A"));
        flight.setR_airport_address(json.getString("r_airport_address", "N/A"));
        flight.setR_terminal(json.getString("r_terminal", "N/A"));
        flight.setR_gate(json.getString("r_gate", "N/A"));
        flight.setR_checkin_time(json.getString("r_checkin_time", "N/A"));
        flight.setR_departure_time(json.getString("r_departure_time", "N/A"));
        return flight;
    }
    



    

    
}
