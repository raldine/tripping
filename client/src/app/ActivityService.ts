import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, lastValueFrom } from "rxjs";
import { ActivityObj, mapActivityObj } from "./models/models";

@Injectable({
    providedIn: "root"
})
export class ActivityService {

    http = inject(HttpClient);

    private oneActivitySubject = new BehaviorSubject<ActivityObj | null>(null);
    private allActivitiesForTripSubject = new BehaviorSubject<ActivityObj[] | null>(null);

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
    
    
}
