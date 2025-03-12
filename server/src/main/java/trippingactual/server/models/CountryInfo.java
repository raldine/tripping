package trippingactual.server.models;

import java.util.List;

public class CountryInfo {

    private String id; // MongoDB ObjectId

    private String country_name;
    private String currency;
    private List<TimeZone> timezones;
    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }
    public String getCountry_name() {
        return country_name;
    }
    public void setCountry_name(String country_name) {
        this.country_name = country_name;
    }
    public String getCurrency() {
        return currency;
    }
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    public List<TimeZone> getTimezones() {
        return timezones;
    }
    public void setTimezones(List<TimeZone> timezones) {
        this.timezones = timezones;
    }
    @Override
    public String toString() {
        return "CountryInfo [id=" + id + ", country_name=" + country_name + ", currency=" + currency + ", timezones="
                + timezones + "]";
    }


    
    

    

}
