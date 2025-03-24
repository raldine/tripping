package trippingactual.server.repositories;

import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import trippingactual.server.models.ActivityObj;
import trippingactual.server.models.LocationObject;
import trippingactual.server.models.TripInfo;

@Repository
public class ActivityRepo {

    @Autowired
    private JdbcTemplate sqlTemplate;

    public String insertActivityTable(ActivityObj newActivity) {

        String insertNewActivityQuery = "INSERT INTO activities(activity_id, trip_id, itinerary_id, event_name, activity_type, start_date, end_date, start_time, end_time, timezone_time, event_notes, location_id, last_updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try {

            int count = sqlTemplate.update(insertNewActivityQuery,
                    newActivity.getActivity_id(),
                    newActivity.getTrip_id(),
                    newActivity.getItinerary_id(),
                    newActivity.getEvent_name(),
                    newActivity.getActivity_type(),
                    new java.sql.Date(newActivity.getStart_date().getTime()),
                    new java.sql.Date(newActivity.getEnd_date().getTime()),
                    newActivity.getStart_time(),
                    newActivity.getEnd_time(),
                    newActivity.getTimezone_time(),
                    newActivity.getEvent_notes(),
                    newActivity.getLocation_id(),
                    newActivity.getLast_updated_by());

            if (count > 0) {
                return "OK";
            } else {
                return "error";
            }

        } catch (DataAccessException ex) {
      
            return ex.getMessage();
        }
   

    }

        public List<ActivityObj> getAllActivitiesForTrip(String trip_id){
        String sqlQuery = "SELECT * from activities WHERE trip_id=?";


        return sqlTemplate.query(sqlQuery, (ResultSet rs) -> {
            List<ActivityObj> activites = new ArrayList<>();
            while (rs.next()) {
                activites.add(ActivityObj.populate(rs));
            }
            return activites;
        }, trip_id);
    }


}
