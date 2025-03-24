package trippingactual.server.repositories;

import java.lang.reflect.AccessFlag.Location;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import trippingactual.server.models.AccommObject;
import trippingactual.server.models.LocationObject;

@Repository
public class LocationRepo {

    @Autowired
    private JdbcTemplate sqlTemplate;

    public String insertLocationTable(LocationObject newLocation) {

        String insertNewLocationQuery = "INSERT INTO locations(location_id, location_lat, location_lng, location_address, location_name, google_place_id, g_biz_number, g_biz_website, g_opening_hrs, trip_id, itinerary_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try {

            String openingHoursString = String.join(",", newLocation.getG_opening_hrs());

            int count = sqlTemplate.update(insertNewLocationQuery,
                    newLocation.getLocation_id(),
                    newLocation.getLocation_lat(),
                    newLocation.getLocation_lng(),
                    newLocation.getLocation_address(),
                    newLocation.getLocation_name(),
                    newLocation.getGoogle_place_id(),
                    newLocation.getG_biz_number(),
                    newLocation.getG_biz_website(),
                    openingHoursString,
                    newLocation.getTrip_id(),
                    newLocation.getItinerary_id());

            if (count > 0) {
                return "OK";
            } else {
                return "error";
            }

        } catch (DataAccessException ex) {
            return ex.getMessage();
        }
       

    }

       public Optional<LocationObject> getLocaObjByAcc_ID(String location_id) {

        String query_locat_locat_id = "SELECT * FROM locations WHERE location_id=?";

        return sqlTemplate.query(query_locat_locat_id, (ResultSet rs) -> {
            if (rs.next()) {
                return Optional.of(LocationObject.populate(rs));
            } else {
                return Optional.empty();
            }
        }, location_id);

    }

        public List<LocationObject> getManyLocationsDetailsByTripId(String tripId) {

        String sqlQuery = "SELECT * FROM locations WHERE trip_id=?";

        return sqlTemplate.query(sqlQuery, (ResultSet rs) -> {
            List<LocationObject> locations = new ArrayList<>();
            while (rs.next()) {
                locations.add(LocationObject.populate(rs));
            }
            return locations;
        }, tripId);
    }



}
