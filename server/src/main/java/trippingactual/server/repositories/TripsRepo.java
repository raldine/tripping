package trippingactual.server.repositories;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.sql.Date;
import trippingactual.server.models.TripInfo;
import trippingactual.server.queries.SqlQueries;

@Repository
public class TripsRepo {
    
    @Autowired
    private JdbcTemplate sqltemplate;

    public String putNewTrip(TripInfo newTripInfo){

            try {

                // trip_id, trip_name, start_date, end_date, destination_city, destination_curr, description_t, cover_image_id, attendees, master_user_id
            int count = sqltemplate.update(SqlQueries.putNewTrip, 
            newTripInfo.getTrip_id(), 
            newTripInfo.getTrip_name(), 
            new java.sql.Date(newTripInfo.getStart_date().getTime()),
            new java.sql.Date(newTripInfo.getEnd_date().getTime()),
            newTripInfo.getDestination_city(),
            newTripInfo.getDestination_curr(),
            newTripInfo.getDescription_t(),
            newTripInfo.getCover_image_id(),
            newTripInfo.getAttendees(),
            newTripInfo.getMaster_user_id(),
            newTripInfo.getLast_updated()
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




}
