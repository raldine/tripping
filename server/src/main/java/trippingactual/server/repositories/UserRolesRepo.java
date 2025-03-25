package trippingactual.server.repositories;

import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import trippingactual.server.models.LocationObject;
import trippingactual.server.models.UserRoles;
import trippingactual.server.queries.SqlQueries;

@Repository
public class UserRolesRepo {

    @Autowired
    private JdbcTemplate sqlTemplate;


    public String initNewUserRoleForTrip(UserRoles userRole){

        String query_string_put = "INSERT INTO user_roles(trip_id, user_id, user_display_name, role, share_id, share_id_view_only, user_email) values (?, ?, ?, ?, ?, ?, ?)";
        try {

            int count = sqlTemplate.update(query_string_put,
                    userRole.getTrip_id(),
                    userRole.getUser_id(),
                    userRole.getUser_display_name(),
                    userRole.getRole(),
                    userRole.getShare_id(),
                    userRole.getShare_id_view_only(),
                    userRole.getUser_email());

            if (count > 0) {
                System.out.println("Success inserted " + userRole);
                return "OK";
            } else {
                return "error";
            }

        } catch (DataAccessException ex) {
            ex.printStackTrace();
        }
        return null;
        
    }


    public String registerUserRoleEditorInExistingTrip(UserRoles newUserRole) {
        try {
            if (userRoleExists(newUserRole.getTrip_id(), newUserRole.getUser_id())) {
                // Update existing record
                System.out.println("existing user role detected going to update");
                String updateQuery = "UPDATE user_roles SET user_display_name = ?, role = ?, share_id = ?, share_id_view_only = NULL, user_email = ? WHERE trip_id = ? AND user_id = ?";
                int count = sqlTemplate.update(updateQuery,
                    newUserRole.getUser_display_name(),
                    "Editor",
                    newUserRole.getShare_id(),
                    newUserRole.getUser_email(),
                    newUserRole.getTrip_id(),
                    newUserRole.getUser_id()
                );
            
                return count > 0 ? "OK" : "error";
            } else {
                // Insert new
                System.out.println("new user role detected going to insert");
                String insertQuery = "INSERT INTO user_roles(trip_id, user_id, user_display_name, role, share_id, share_id_view_only, user_email) VALUES (?, ?, ?, ?, ?, ?, ?)";
                int count = sqlTemplate.update(insertQuery,
                    newUserRole.getTrip_id(),
                    newUserRole.getUser_id(),
                    newUserRole.getUser_display_name(),
                    "Editor",
                    newUserRole.getShare_id(),
                    null,
                    newUserRole.getUser_email()
                );
                return count > 0 ? "OK" : "error";
            }
        } catch (DataAccessException ex) {
            ex.printStackTrace();
            return "error";
        }
    }
    

    public String registerUserRoleVIEWONLYInExistingTrip(UserRoles newUserRole) {
        try {
            if (userRoleExists(newUserRole.getTrip_id(), newUserRole.getUser_id())) {
                System.out.println("existing user role detected going to update");
                String updateQuery = "UPDATE user_roles SET user_display_name = ?, role = ?, share_id = NULL, share_id_view_only = ?, user_email = ? WHERE trip_id = ? AND user_id = ?";
                int count = sqlTemplate.update(updateQuery,
                    newUserRole.getUser_display_name(),
                    "Viewer",
                    newUserRole.getShare_id_view_only(),
                    newUserRole.getUser_email(),
                    newUserRole.getTrip_id(),
                    newUserRole.getUser_id()
                );
                return count > 0 ? "OK" : "error";
            } else {
                System.out.println("new user role detected going to insert");
                String insertQuery = "INSERT INTO user_roles(trip_id, user_id, user_display_name, role, share_id, share_id_view_only, user_email) VALUES (?, ?, ?, ?, ?, ?, ?)";
                int count = sqlTemplate.update(insertQuery,
                    newUserRole.getTrip_id(),
                    newUserRole.getUser_id(),
                    newUserRole.getUser_display_name(),
                    "Viewer",
                    null,
                    newUserRole.getShare_id_view_only(),
                    newUserRole.getUser_email()
                );
                return count > 0 ? "OK" : "error";
            }
        } catch (DataAccessException ex) {
            ex.printStackTrace();
            return "error";
        }
    }
    

    public String getUsersRoleForParticularTrip(String user_id, String trip_id) {
        String query = "SELECT role FROM user_roles WHERE user_id = ? AND trip_id = ?";
    
        List<String> roles = sqlTemplate.query(query, 
            (rs, rowNum) -> rs.getString("role"),
            user_id, trip_id
        );
    
        return roles.isEmpty() ? "not exist" : roles.get(0);
    }


    public String getShareIDForTrip(String user_id, String trip_id){

        String query_String= "SELECT * FROM user_roles WHERE trip_id=? AND user_id=?";

      

    Optional<UserRoles> result = sqlTemplate.query(query_String, (ResultSet rs) -> {
            if (rs.next()) {
                return Optional.of(UserRoles.populate(rs));
            } else {
                return Optional.empty();
            }
        }, trip_id, user_id);


        if(!result.isEmpty()){
            String role = result.get().getShare_id();

            return role;
        } else {

            return "failed";
        }


    }

    public String getShareIDVIEWONLYForTrip(String user_id, String trip_id){

        String query_String= "SELECT * FROM user_roles WHERE trip_id=? AND user_id=?";

      

    Optional<UserRoles> result = sqlTemplate.query(query_String, (ResultSet rs) -> {
            if (rs.next()) {
                return Optional.of(UserRoles.populate(rs));
            } else {
                return Optional.empty();
            }
        }, trip_id, user_id);


        if(!result.isEmpty()){
            String role = result.get().getShare_id_view_only();

            return role;
        } else {

            return "failed";
        }


    }

    public List<UserRoles> getALLUSERSROLESFORATRIP(String trip_id){

          

        String sqlQuery = "SELECT * FROM user_roles WHERE trip_id=? ORDER BY user_display_name ASC";

        return sqlTemplate.query(sqlQuery, (ResultSet rs) -> {
            List<UserRoles> users = new ArrayList<>();
            while (rs.next()) {
                users.add(UserRoles.populate(rs));
            }
            return users;
        }, trip_id);
    }

    private boolean userRoleExists(String tripId, String userId) {
        String checkQuery = "SELECT COUNT(*) FROM user_roles WHERE trip_id = ? AND user_id = ?";
        Integer count = sqlTemplate.queryForObject(checkQuery, Integer.class, tripId, userId);
        return count != null && count > 0;
    }
    


    

    }
    

