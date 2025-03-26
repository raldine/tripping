package trippingactual.server.repositories;

import java.io.IOException;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;


import trippingactual.server.models.FileObject;

@Repository
public class UserFilesRepo {

    @Autowired
    private JdbcTemplate sqltemplate;


        // upload file query
    public static final String uploadq = "INSERT INTO resources(resource_id, trip_id, activity_id, accommodation_id, flight_id, user_id_pp, original_file_name, media_type, do_src_link) VALUES(?, ?,?,?,?,?,?,?,?)";

    // get uploaded file query
    public static final String getfile = "SELECT * FROM resources where resource_id=?";

    public static final String getFilesByTripId = "SELECT * from resources where trip_id=?";

   

    public FileObject upload(FileObject allDataForSql) throws SQLException, IOException {
        try {
            sqltemplate.update(uploadq, ps -> {
                ps.setString(1, allDataForSql.getResourceId());
                ps.setString(2, allDataForSql.getTrip_id());
                ps.setString(3, allDataForSql.getActivity_id());
                ps.setString(4, allDataForSql.getAccommodation_id());
                ps.setString(5, allDataForSql.getFlight_id());
                ps.setString(6, allDataForSql.getUser_id_pp());
                ps.setString(7, allDataForSql.getOriginal_file_name());
                ps.setString(8, allDataForSql.getMedia_type());
                ps.setString(9, allDataForSql.getDo_src_link());
            });

            System.out.println("before uploading to sql finalFileObject >>>>>> " + allDataForSql.toString());
            

            //get to check success upload?
            Optional<FileObject> op = getFilebyID(allDataForSql.getResourceId());


            if(op.get().getUploaded_on()!=null){

                return op.get();

            } else {
                throw new SQLException("Error uploading to Sql");
            }
           

        } catch (SQLException ex) {

            System.out.println(ex.getMessage());
            


            return null;

        }

    }

    public Optional<FileObject> getFilebyID(String resourceId) {
     
            return sqltemplate.query(getfile, (ResultSet rs) -> {
                if (rs.next()) {
                    return Optional.of(FileObject.populate(rs));
                } else {
                    return Optional.empty();
                }
            }, resourceId);

    }

    public List<FileObject> getFilesByTripId(String tripId) {
    return sqltemplate.query(getFilesByTripId, (ResultSet rs) -> {
        List<FileObject> fileObjects = new ArrayList<>();
        while (rs.next()) {
            fileObjects.add(FileObject.populate(rs));
        }
        return fileObjects;
    }, tripId);
}




}
