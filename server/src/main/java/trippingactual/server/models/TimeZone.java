package trippingactual.server.models;

public class TimeZone {

    private String gmtOffsetName;
    private String abbreviation;
    private String tzName;

    // Getters and Setters
    public String getGmtOffsetName() {
        return gmtOffsetName;
    }

    public void setGmtOffsetName(String gmtOffsetName) {
        this.gmtOffsetName = gmtOffsetName;
    }

    public String getAbbreviation() {
        return abbreviation;
    }

    public void setAbbreviation(String abbreviation) {
        this.abbreviation = abbreviation;
    }

    public String getTzName() {
        return tzName;
    }

    public void setTzName(String tzName) {
        this.tzName = tzName;
    }

    @Override
    public String toString() {
        return "TimeZone [gmtOffsetName=" + gmtOffsetName + ", abbreviation=" + abbreviation + ", tzName=" + tzName
                + "]";
    }

    
    
}
