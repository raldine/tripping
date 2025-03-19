package trippingactual.server.repositories;

import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import trippingactual.server.models.FileObject;
import trippingactual.server.models.ItineraryObject;
import trippingactual.server.services.ItineraryBuilder;

@Repository
public class ItnRepo {

    @Autowired
    private JdbcTemplate sqlTemplate;

    public void addNewItineraries(List<ItineraryObject> itineraries) {

        String itnAdder_query = "INSERT INTO itinerary(itinerary_id, trip_id, itn_date) VALUES (?, ?, ?)";

        try {

            List<Object[]> recs = itineraries.stream()
                    .map(s -> {
                        Object[] fields = new Object[3];
                        fields[0] = s.getItinerary_id();
                        fields[1] = s.getTrip_id();
                        fields[2] = s.getItn_date();

                        return fields;
                    })
                    .toList();

            int[] results = sqlTemplate.batchUpdate(itnAdder_query, recs);

            for (int i : results) {
                if (i == 0) {
                    throw new Exception("Error initiating batches of itineraries");
                }
            }

        } catch (Exception e) {
            System.out.println(e.getMessage());
        }

    }

    public List<ItineraryObject> getItnryByTripId(String tripId) {

        String get_itnr_trip_id = "SELECT * FROM itinerary where trip_id=? ORDER BY itn_date ASC";

        return sqlTemplate.query(get_itnr_trip_id, (ResultSet rs) -> {
            List<ItineraryObject> itnyObjects = new ArrayList<>();
            while (rs.next()) {
                itnyObjects.add(ItineraryObject.populate(rs));
            }
            return itnyObjects;
        }, tripId);

    }

}
