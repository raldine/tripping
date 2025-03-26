package trippingactual.server.repositories;

import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import trippingactual.server.models.AccommObject;

@Repository
public class AccommodationRepo {

    @Autowired
    private JdbcTemplate sqlTemplate;

    public String insertIntoAccommodationTable(AccommObject newAccom) {

        String insertNewAccQuery = "INSERT INTO accommodations(accommodation_id, accommodation_name, trip_id, check_in_date, check_in_time, check_out_date, check_out_time, timezone_time, event_notes, location_id, last_updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try {

            int count = sqlTemplate.update(insertNewAccQuery,
                    newAccom.getAccommodation_id(),
                    newAccom.getAccommodation_name(),
                    newAccom.getTrip_id(),
                    new java.sql.Date(newAccom.getCheck_in_date().getTime()),
                    newAccom.getCheck_in_time(),
                    new java.sql.Date(newAccom.getCheck_out_date().getTime()),
                    newAccom.getCheck_out_time(),
                    newAccom.getTimezone_time(),
                    newAccom.getEvent_notes(),
                    newAccom.getLocation_id(),
                    newAccom.getLast_updated_by());

            if (count > 0) {
                return "OK";
            } else {
                return "error";
            }

        } catch (DataAccessException ex) {
            return ex.getMessage();
        }

    }

    public Optional<AccommObject> getAccommObjByAcc_ID(String accommodation_id) {

        String query_acc_acc_id = "SELECT * FROM accommodations WHERE accommodation_id=?";

        return sqlTemplate.query(query_acc_acc_id, (ResultSet rs) -> {
            if (rs.next()) {
                return Optional.of(AccommObject.populate(rs));
            } else {
                return Optional.empty();
            }
        }, accommodation_id);

    }

    public List<AccommObject> getManyAccommDetailsByTripId(String tripId) {

        String sqlQuery = "SELECT * FROM accommodations WHERE trip_id=? ORDER BY check_in_date ASC";

        return sqlTemplate.query(sqlQuery, (ResultSet rs) -> {
            List<AccommObject> accomms = new ArrayList<>();
            while (rs.next()) {
                accomms.add(AccommObject.populate(rs));
            }
            return accomms;
        }, tripId);
    }

}
