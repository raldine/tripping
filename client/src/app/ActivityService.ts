import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, lastValueFrom } from "rxjs";
import { ActivityObj, ActivityTypeOption, mapActivityObj } from "./models/models";

@Injectable({
    providedIn: "root"
})
export class ActivityService {

    http = inject(HttpClient);

    private activityTypesOptions: ActivityTypeOption[] = [
        { name: "Nature / Sightseeing", icon: "https://trippingresources.sgp1.cdn.digitaloceanspaces.com/webresources/sightsee.png" },
        { name: "Shopping", icon: "https://trippingresources.sgp1.cdn.digitaloceanspaces.com/webresources/shopping.png" },
        { name: "Food / Restaurant", icon: "https://trippingresources.sgp1.cdn.digitaloceanspaces.com/webresources/food.png"},
        { name: "Guided Tour", icon: "https://trippingresources.sgp1.cdn.digitaloceanspaces.com/webresources/tour.png"},
        { name: "Theme Park", icon: "https://trippingresources.sgp1.cdn.digitaloceanspaces.com/webresources/themepark.png"},
        { name: "Museum / War Memorial", icon: "https://trippingresources.sgp1.cdn.digitaloceanspaces.com/webresources/museum.png"},
        { name: "Concert / Theater", icon: "https://trippingresources.sgp1.cdn.digitaloceanspaces.com/webresources/concert.png"},
        { name: "Zoo / Aquarium", icon: "https://trippingresources.sgp1.cdn.digitaloceanspaces.com/webresources/zooaqua.png"},
        { name: "Transport", icon: "https://trippingresources.sgp1.cdn.digitaloceanspaces.com/webresources/transport.png"},
        { name: "Check In - Flight", icon: "https://trippingresources.sgp1.cdn.digitaloceanspaces.com/webresources/check-in-flight.png"},
        { name: "Check In - Accomm", icon: "https://trippingresources.sgp1.cdn.digitaloceanspaces.com/webresources/acc-check-in.png"},
        { name: "Check Out - Accomm", icon: "https://trippingresources.sgp1.cdn.digitaloceanspaces.com/webresources/acc-check-out.png"},
        { name: "Others", icon: "https://trippingresources.sgp1.cdn.digitaloceanspaces.com/webresources/others.png"}
     ];

    private oneActivitySubject = new BehaviorSubject<ActivityObj | null>(null);
    private allActivitiesForTripSubject = new BehaviorSubject<ActivityObj[] | null>(null);

        async putNewActivity(form: any, firebase_uid: string) {
    
    
            const headers = new HttpHeaders({
                'Authorization': firebase_uid
            });
    
            const formData = new FormData();
    
    
    
            formData.set("activity_id", form["activity_id"] ?? "N/A");
            formData.set("trip_id", form["trip_id"] ?? "N/A");
            formData.set("itinerary_id", form["itinerary_id"] ?? "N/A");
            formData.set("event_name", form["event_name"] ?? "N/A");
            formData.set("activity_type", form["activity_type"] ?? "N/A");
            formData.set("start_date", form["start_date"] ?? "N/A");
            formData.set("end_date", form["end_date"] ?? "N/A");
            formData.set("start_time", form["start_time"] ?? "N/A");
            formData.set("end_time", form["end_time"] ?? "N/A");
            formData.set("timezone_time", form["timezone_time"] ?? "N/A");
            formData.set("event_notes", form["event_notes"] ?? "N/A");
            formData.set("location_id", form["location_id"] ?? "N/A");
            formData.set("location_lat", form["location_lat"] ?? "N/A");
            formData.set("location_lng", form["location_lng"] ?? "N/A");
            formData.set("location_address", form["location_address"] ?? "N/A");
            formData.set("location_name", form["location_name"] ?? "N/A");
            formData.set("google_place_id", form["google_place_id"] ?? "N/A");
            formData.set("g_biz_number", form["g_biz_number"] ?? "N/A");
            formData.set("g_biz_website", form["g_biz_website"] ?? "N/A");
    
            // If g_opening_hrs is an array, join it into a comma-separated string
            const openingHoursArray = form["g_opening_hrs"] ?? ["N/A"];
            const openingHoursString = openingHoursArray.join(","); // Convert array to string
    
            // Set the g_opening_hrs field as a string
            formData.set("g_opening_hrs", openingHoursString);
    
    
            // Debugging: Log all FormData keys & values
            console.log("FROM ACTIVITY SERVICE >>>>>>>>>>> ")
            formData.forEach((value, key) => console.log(`${key}: ${value}`));
    
    
            try {
                const response = await lastValueFrom(
                    this.http.put<any>("/api/activities/addnewActi", formData, { headers })
                );
                console.info("Response received: ", response);
               
                if (response?.response === "Error registering activity") {
                    console.warn("FAILED TO SUBMIT ACTIVITYY");
                    return null;
                }
    
                return response.response as string;
            } catch (error) {
                console.error("Error during adding activity:", error);
                throw error;  // Re-throwing error after logging
            }
    
    
    
        }

    // Fetch a single activity by activity_id
    // async getActivityObjFromActivityId(activity_id: string, firebaseUid: string) {
    //     const headers = new HttpHeaders({
    //         "Authorization": firebaseUid
    //     });

    //     let params = new HttpParams();
    //     params = params.set("activity_id", activity_id);

    //     try {
    //         const response = await lastValueFrom(
    //             this.http.get<any>("/api/activities/get-activity", { headers, params })
    //         );

    //         console.log("Raw response:", response);

    //         if (response?.response === "Error: No activity found") {
    //             console.warn("No activity found. Returning an empty activity.");
    //             return null;
    //         }

    //         const activityObj: ActivityObj = mapActivityObj(response);
    //         return activityObj;

    //     } catch (error) {
    //         console.error("Error fetching activity:", error);
    //         return null;
    //     }
    // }

    // Fetch all activities for a given trip_id
    async getAllActivitiesFromTripId(trip_id: string, firebaseUid: string) {
        const headers = new HttpHeaders({
            "Authorization": firebaseUid
        });

        let params = new HttpParams();
        params = params.set("trip_id", trip_id);

        try {
            const response = await lastValueFrom(
                this.http.get<any>("/api/activities/get-all-activities", { headers, params })
            );

            console.log("Raw response:", response);

            if (response?.response === "No activities found") {
                console.warn("No activities found. Returning an empty array.");
                return [];
            }

            return response.map((activity: any) => mapActivityObj(activity));

        } catch (error) {
            console.error("Error fetching activities:", error);
            return [];
        }
    }

    // Set and get activity data for sharing across components
    setOneActivity(oneActivity: ActivityObj | null) {
        this.oneActivitySubject.next(oneActivity);
    }

    setAllActivitiesForTrip(allActivities: ActivityObj[] | null) {
        this.allActivitiesForTripSubject.next(allActivities);
        console.log("Stored activities in service", this.allActivitiesForTripSubject.getValue());
    }

    getOneActivitySet(): ActivityObj | null {
        return this.oneActivitySubject.getValue();
    }

    getAllActivitiesForTrip(): ActivityObj[] | null {
        return this.allActivitiesForTripSubject.getValue();
    }

    getOneActivityFromCurrentAllActivitiesForTrip(activity_id: string): ActivityObj | null {
        const currentActivities = this.allActivitiesForTripSubject.getValue();
        if (currentActivities) {
            const activity = currentActivities.find(act => act.activity_id === activity_id);
            console.log('Found activity:', activity);  // Debug log for found activity
            return activity ?? null;
        }
        return null;
    }

    getActivitiesFromCurrentAllActivitiesForItineraryDay(itinerary_id: string): ActivityObj[] | null {
        const currentActivities = this.allActivitiesForTripSubject.getValue();
        if(itinerary_id === ''){
            return null;
        }
        if (currentActivities) {
          
            const filteredActivities = currentActivities.filter(act => act.itinerary_id === itinerary_id);
            console.log('Filtered activities:', filteredActivities);  // Debug log for found activities
    
            // Sort activities by start_time in ascending order
            const sortedActivities = filteredActivities.sort((a, b) => {
                // Convert start_time strings to Date objects for comparison
                const aTime = new Date(`1970-01-01T${a.start_time}Z`);
                const bTime = new Date(`1970-01-01T${b.start_time}Z`);
    
                return aTime.getTime() - bTime.getTime();
            });
    
            return sortedActivities.length > 0 ? sortedActivities : null;
        }
        return null;
    }


     // get icon by name
  getIconByName(name: string): string | undefined {
    return this.activityTypesOptions.find(type => type.name === name)?.icon;
  }

     // get names only
  getActivityTypeNames(): string[] {
    return this.activityTypesOptions.map(type => type.name);
  }


  async deleteActivityByActivityid(firebaseUid: string, activity_id: string){

    const headers = new HttpHeaders({
        "Authorization": firebaseUid
    });

    let params = new HttpParams();
    params = params.set("activity_id", activity_id);

    try {
        // Make the HTTP GET request
        const response = await lastValueFrom(
            this.http.delete<any>("/api/activities/delete", { headers, params })
        );

        console.log("Raw response:", response); // Debugging

        // ✅ Check if API returned "No trips found"
        if (response?.response === "No activity deleted") {
            console.warn("No activity deleted. Returning an empty string.");
            return "";
        }

        
        return response.deleted_id as string;

    } catch (error) {
        console.error("Error deleteing activity", error);
        return "";
    }

}
    
}
