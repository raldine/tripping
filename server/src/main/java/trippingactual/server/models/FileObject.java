package trippingactual.server.models;

import java.io.Serializable;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

public class FileObject implements Serializable {


    private String resource_id;

    // private String comments;

    // private byte[] image;

    private String trip_id = null;
    private String accommodation_id = null;
    private String activity_id= null;
    private String flight_id = null;
    private String user_id_pp = null;
    private String original_file_name = null;
    private String media_type= null;
    private String do_src_link= null;
    private Timestamp uploaded_on;

    public String getResourceId() {
        return resource_id;
    }
    public void setResourceId(String resource_id) {
        this.resource_id = resource_id;
    }
    public String getTrip_id() {
        return trip_id;
    }
    public void setTrip_id(String trip_id) {
        this.trip_id = trip_id;
    }
    public String getAccommodation_id() {
        return accommodation_id;
    }
    public void setAccommodation_id(String accommodation_id) {
        this.accommodation_id = accommodation_id;
    }
    public String getFlight_id() {
        return flight_id;
    }
    public void setFlight_id(String flight_id) {
        this.flight_id = flight_id;
    }
    public String getOriginal_file_name() {
        return original_file_name;
    }
    public void setOriginal_file_name(String original_file_name) {
        this.original_file_name = original_file_name;
    }
    public String getMedia_type() {
        return media_type;
    }
    public void setMedia_type(String media_type) {
        this.media_type = media_type;
    }
    public String getDo_src_link() {
        return do_src_link;
    }
    public void setDo_src_link(String do_src_link) {
        this.do_src_link = do_src_link;
    }
    public Timestamp getUploaded_on() {
        return uploaded_on;
    }
    public void setUploaded_on(Timestamp uploaded_on) {
        this.uploaded_on = uploaded_on;
    }


    public String getActivity_id() {
        return activity_id;
    }
    public void setActivity_id(String activity_id) {
        this.activity_id = activity_id;
    }

    
    public String getUser_id_pp() {
        return user_id_pp;
    }
    public void setUser_id_pp(String user_id_pp) {
        this.user_id_pp = user_id_pp;
    }
 


    @Override
    public String toString() {
        return "FileObject [resource_id=" + resource_id + ", trip_id=" + trip_id + ", accommodation_id="
                + accommodation_id + ", activity_id=" + activity_id + ", flight_id=" + flight_id + ", user_id_pp="
                + user_id_pp + ", original_file_name=" + original_file_name + ", media_type=" + media_type
                + ", do_src_link=" + do_src_link + ", uploaded_on=" + uploaded_on + "]";
    }

    public static FileObject populate(ResultSet rs) throws SQLException {
        FileObject file = new FileObject();

        file.setResourceId(rs.getString("resource_id"));
        file.setTrip_id(rs.getString("trip_id"));
        file.setAccommodation_id(rs.getString("accommodation_id"));
        file.setActivity_id(rs.getString("activity_id"));
        file.setFlight_id(rs.getString("flight_id"));
        file.setUser_id_pp(rs.getString("user_id_pp"));
        file.setOriginal_file_name(rs.getString("original_file_name"));
        file.setMedia_type(rs.getString("media_type"));
        file.setDo_src_link(rs.getString("do_src_link"));
        file.setUploaded_on(rs.getTimestamp("uploaded_on"));

    

        return file;


    }

    


    




  
    
    
}
