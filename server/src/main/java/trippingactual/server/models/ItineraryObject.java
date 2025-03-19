package trippingactual.server.models;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Date;

public class ItineraryObject {

    private String itinerary_id;
    private String trip_id;
    private Date itn_date;
    public String getItinerary_id() {
        return itinerary_id;
    }
    public void setItinerary_id(String itinerary_id) {
        this.itinerary_id = itinerary_id;
    }
    public String getTrip_id() {
        return trip_id;
    }
    public void setTrip_id(String trip_id) {
        this.trip_id = trip_id;
    }
    public Date getItn_date() {
        return itn_date;
    }
    public void setItn_date(Date itn_date) {
        this.itn_date = itn_date;
    }

   public static ItineraryObject populate(ResultSet rs) throws SQLException {
        ItineraryObject itnr = new ItineraryObject();

        itnr.setItinerary_id(rs.getString("itinerary_id"));
        itnr.setTrip_id(rs.getString("trip_id"));
        itnr.setItn_date(TripInfo.parseDate(rs.getString("start_date")));
      

    

        return itnr;


    }

    


    
    
}
