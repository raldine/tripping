package trippingactual.server.utils;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

public class TimeManipulator {

    public static String addMinutesToTimeString(String timeString, long minutesToAdd) {
        // Step 1: Parse the time string into a LocalTime object
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
        LocalTime time = LocalTime.parse(timeString, formatter);
        
        // Step 2: Add 10 minutes to the time
        time = time.plusMinutes(minutesToAdd);
        
        // Step 3: Convert the updated LocalTime back to a string
        return time.format(formatter);
    }

    // public static void main(String[] args) {
    //     String checkInTime = "10:30:00"; // Example time
    //     String updatedTime = addMinutesToTimeString(checkInTime, 10); // Add 10 minutes
        
    //     System.out.println("Updated time: " + updatedTime); // Output: 10:40:00
    // }
}
