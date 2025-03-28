package trippingactual.server.repositories;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.util.ArrayList;

import java.util.List;
import java.util.Optional;


import trippingactual.server.models.TripInfo;

import trippingactual.server.queries.SqlQueries;

@Repository
public class TripsRepo {

    @Autowired
    private JdbcTemplate sqltemplate;

    public String putNewTrip(TripInfo newTripInfo) {

        System.out.println("TRIP REPO SERVICE SIDE, RECEIVED TRIPINFO IS: ");

        try {

            // trip_id, trip_name, start_date, end_date, destination_city, destination_curr,
            // destination_timezone, d_timezone_name, d_iso2, dest_lat, dest_lng,
            // description_t, cover_image_id, attendees, master_user_id
            int count = sqltemplate.update(SqlQueries.putNewTrip,
                    newTripInfo.getTrip_id(),
                    newTripInfo.getTrip_name(),
                    new java.sql.Date(newTripInfo.getStart_date().getTime()),
                    new java.sql.Date(newTripInfo.getEnd_date().getTime()),
                    newTripInfo.getDestination_city(),
                    newTripInfo.getDestination_curr(),
                    newTripInfo.getDestination_timezone(),
                    newTripInfo.getD_timezone_name(),
                    newTripInfo.getD_iso2(),
                    newTripInfo.getDest_lat(),
                    newTripInfo.getDest_lng(),
                    newTripInfo.getDescription_t(),
                    newTripInfo.getCover_image_id(),
                    newTripInfo.getAttendees(),
                    newTripInfo.getMaster_user_id());

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

    public List<TripInfo> getAllTripsByUserId(String firebaseUid) {
        String sqlQuery = """
            (
                SELECT * FROM trips 
                WHERE master_user_id = ?
            )
            UNION
            (
                SELECT t.* FROM trips t
                JOIN user_roles ur ON t.trip_id = ur.trip_id
                WHERE ur.user_id = ? AND ur.role IN ('editor', 'viewer')
            )
            ORDER BY last_updated DESC
            """;
    
        return sqltemplate.query(sqlQuery, (ResultSet rs) -> {
            List<TripInfo> trips = new ArrayList<>();
            while (rs.next()) {
                trips.add(TripInfo.populate(rs));
            }
            return trips;
        }, firebaseUid, firebaseUid); // You pass it twice for the 2 placeholders
    }
    

    public String deleteTripByTrip_id(String trip_id) {
        String sqlQuery = "DELETE FROM trips WHERE trip_id=?";

        try {

            int status = sqltemplate.update(sqlQuery, trip_id);

            if (status == 1) {
                return trip_id;
            } else {
                return "Error";
            }

        } catch (DataAccessException ex) {
            System.out.println("Error on sql side when deleting");

            return "Error";
        }

    }

    public Optional<TripInfo> getTripById(String trip_id) {

        String query_trip_tripid = "SELECT * FROM trips WHERE trip_id=?";

        return sqltemplate.query(query_trip_tripid, (ResultSet rs) -> {
            if (rs.next()) {
                return Optional.of(TripInfo.populate(rs));
            } else {
                return Optional.empty();
            }
        }, trip_id);

    }

}
