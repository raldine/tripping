import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, lastValueFrom } from "rxjs";
import { AccommodationObj, mapAccommObj } from "./models/models";

@Injectable({
    providedIn: 'root'
})
export class AccommodationService {

    http = inject(HttpClient);

    //for sharing across components
    private oneAccommSubject = new BehaviorSubject<AccommodationObj | null>(null);
    private allAccommForTripSubject = new BehaviorSubject<AccommodationObj[] | null>(null);


    async putNewAccomm(form: any, firebase_uid: string) {


        const headers = new HttpHeaders({
            'Authorization': firebase_uid
        });

        const formData = new FormData();



        formData.set("accommodation_id", form["accommodation_id"] ?? "N/A");
        formData.set("trip_id", form["trip_id"] ?? "N/A");
        formData.set("check_in_date", form["check_in_date"] ?? "N/A");
        formData.set("check_in_time", form["check_in_time"] ?? "N/A");
        formData.set("check_out_date", form["check_out_date"] ?? "N/A");
        formData.set("check_out_time", form["check_out_time"] ?? "N/A");
        formData.set("timezone_time", form["timezone_time"] ?? "N/A");
        formData.set("accommodation_name", form["accommodation_name"] ?? "N/A");
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
        console.log("FROM ACCOMODATION SERVICE >>>>>>>>>>> ")
        formData.forEach((value, key) => console.log(`${key}: ${value}`));


        try {
            const response = await lastValueFrom(
                this.http.put<any>("/api/accomm/newaccomm", formData, { headers })
            );
            console.info("Response received: ", response);
            const objectReturned: AccommodationObj = {
                accommodation_id: response.response.accommodation_id,
                accommodation_name: response.response.accommodation_name,
                trip_id: response.response.trip_id,
                check_in_date: response.response.check_in_date,
                check_in_time: response.response.check_in_time,
                check_out_date: response.response.check_out_date,
                check_out_time: response.response.check_out_time,
                timezone_time: response.response.timezone_time,
                event_notes: response.response.event_notes,
                location_id: response.response.location_id,
                last_updated_by: response.response.last_updated_by,
                last_updated: response.response.last_updated
            }
            return objectReturned;
        } catch (error) {
            console.error("Error during adding accommodation:", error);
            throw error;  // Re-throwing error after logging
        }



    }

    async getAllAccommsFromTripId(trip_id: string, firebaseUid: string) {

        const headers = new HttpHeaders({
            "Authorization": firebaseUid
        });

        let params = new HttpParams();
        params = params.set("trip_id", trip_id);

        try {
            // Make the HTTP GET request
            const response = await lastValueFrom(
                this.http.get<any>("/api/accomm/get-accomms", { headers, params })
            );

            console.log("Raw response:", response); // Debugging


            if (response?.response === "No accommodations found") {
                console.warn("No accommodations found. Returning an empty array.");
                return [];
            }


            return response.map((accomm: any) => mapAccommObj(accomm));

        } catch (error) {
            console.error("Error fetching accommodations:", error);
            return [];
        }

    }

    //passing from component to component
            //set
            setOneAccommObj(oneAccomm: AccommodationObj | null) {
                this.oneAccommSubject.next(oneAccomm);
            }
        
        
            setAllAccommsforTrip(allAccoms: AccommodationObj[] | null) {
                this.allAccommForTripSubject.next(allAccoms);
                console.log("stored in service ", this.allAccommForTripSubject.getValue())
            }
        
        
            //get
            getOneAccommSet(): AccommodationObj | null {
                return this.oneAccommSubject.getValue();
            }
        
            getAllAccommsForTrip(): AccommodationObj[] | null {
                return this.allAccommForTripSubject.getValue();
            }








}