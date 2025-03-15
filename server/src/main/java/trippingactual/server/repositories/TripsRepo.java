package trippingactual.server.repositories;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.sql.Date;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import trippingactual.server.models.TripInfo;
import trippingactual.server.models.UserInfo;
import trippingactual.server.queries.SqlQueries;

@Repository
public class TripsRepo {
    
    @Autowired
    private JdbcTemplate sqltemplate;

    public String putNewTrip(TripInfo newTripInfo){

        System.out.println("TRIP REPO SERVICE SIDE, RECEIVED TRIPINFO IS: ");

            try {

// trip_id, trip_name, start_date, end_date, destination_city, destination_curr, destination_timezone, d_timezone_name, description_t, cover_image_id, attendees, master_user_id
            int count = sqltemplate.update(SqlQueries.putNewTrip, 
            newTripInfo.getTrip_id(), 
            newTripInfo.getTrip_name(), 
            new java.sql.Date(newTripInfo.getStart_date().getTime()),
            new java.sql.Date(newTripInfo.getEnd_date().getTime()),
            newTripInfo.getDestination_city(),
            newTripInfo.getDestination_curr(),
            newTripInfo.getDestination_timezone(),
            newTripInfo.getD_timezone_name(),
            newTripInfo.getDescription_t(),
            newTripInfo.getCover_image_id(),
            newTripInfo.getAttendees(),
            newTripInfo.getMaster_user_id()
            );

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


    public List<TripInfo> getAllTripsByUserId(String firebaseuid){
        String sqlQuery = "SELECT * from trips WHERE master_user_id=? ORDER BY last_updated DESC";


        return sqltemplate.query(sqlQuery, (ResultSet rs) -> {
            List<TripInfo> tripsBelongingToUser = new ArrayList<>();
            while (rs.next()) {
                tripsBelongingToUser.add(TripInfo.populate(rs));
            }
            return tripsBelongingToUser;
        }, firebaseuid);
    }



   
}
