import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { lastValueFrom } from "rxjs";
import { ImageFetcherService } from "./ImageFetcherService";
import { TripInfo } from "./models/models";
import { mapTripInfo } from "./models/models";

@Injectable({
    providedIn: 'root'
})
export class TripService {

    // For auto-loading trip cover image
    imageFetcherService = inject(ImageFetcherService);
    http = inject(HttpClient);

    async putNewTrip(form: any, filebytes: Blob | null, firebase_uid: string, user_display_name: string, user_email: string) {
        console.info("calling add new trip service");
        console.log("value of newtripform is ", form);

        const headers = new HttpHeaders({
            'Authorization': firebase_uid
        });

        const formData = new FormData();

        // Append trip details safely
        formData.set("trip_id", form["trip_id"] ?? "N/A");
        formData.set("trip_name", form["trip_name"] ?? "N/A");
        formData.set("start_date", form["start_date"] ?? "N/A");
        formData.set("end_date", form["end_date"] ?? "N/A");
        formData.set("destination_city", form["destination_city"] ?? "N/A");
        formData.set("destination_curr", form["destination_curr"] ?? "N/A");
        formData.set("destination_timezone", form["destination_timezone"] ?? "N/A");
        formData.set("d_timezone_name", form["d_timezone_name"] ?? "N/A");
        formData.set("d_iso2", form["d_iso2"] ?? "N/A");
        formData.set("dest_lat", form["dest_lat"] ?? "N/A")
        formData.set("dest_lng", form["dest_lng"] ?? "N/A")
        formData.set("description_t", form["description_t"] ?? "N/A");
        formData.set("cover_image_id", form["cover_image_id"] ?? "N/A");
        formData.set("attendees", form["attendees"] ?? "N/A");
        formData.set("master_user_id", form["master_user_id"] ?? "N/A");
        formData.set("m_user_display_name", user_display_name);
        formData.set("m_user_email", user_email);

        // ✅ Append File if exists
        if (filebytes) {
            console.log("Uploading user-selected cover image...");
            formData.set("file", filebytes);
            formData.set("comments", form["comments"] ?? "cimage");
            // formData.set("accommodation_id", form["accommodation_id"] ?? "N/A");
            // formData.set("activity_id", form["activity_id"] ?? "N/A");
            // formData.set("flight_id", form["flight_id"] ?? "N/A");
            // formData.set("user_id_pp", form["user_id_pp"] ?? "N/A");
            formData.set("original_file_name", form["original_file_name"] ?? "unknownfilename");
        } else {
            console.log("No uploaded cover image, fetching placeholder image...");
            let query = form['destination_city'];

            try {
                const photoUrl = await this.imageFetcherService.fetchRandomImage(query.replaceAll("-", " "));
                if (photoUrl) {
                    formData.set("comments", "cimage");
                    formData.set("photourl", photoUrl);
                    formData.set("media_type", "image/*");
                    console.log("Fetched placeholder image:", photoUrl);
                } else {
                    console.warn("No image found from Pexels, using default.");
                }
            } catch (error) {
                console.error("No Pexels result:", error);
            }
        }

        // Debugging: Log all FormData keys & values
        formData.forEach((value, key) => console.log(`${key}: ${value}`));

        // Always attempt to send formData to the backend
        try {
            const response = await lastValueFrom(
                this.http.put<{ response: string }>("https://industrious-perfection-production.up.railway.app/trip/newtrip", formData, { headers })
            );
            console.info("Response received: ", response);
            return response.response;
        } catch (error) {
            console.error("Error during adding trip:", error);
            throw error;  // Re-throwing error after logging
        }
    }



    async getAllTripsByUserId(firebaseUid: string): Promise<TripInfo[]> {
        const headers = new HttpHeaders({
            "Authorization": firebaseUid
        });

        try {
            // Make the HTTP GET request
            const response = await lastValueFrom(
                this.http.get<any>("https://industrious-perfection-production.up.railway.app/trip/get-trips/" + firebaseUid, { headers })
            );

            console.log("Raw response:", response); // Debugging

            // ✅ Check if API returned "No trips found"
            if (response?.response === "No trips found") {
                console.warn("No trips found. Returning an empty array.");
                return [];
            }

            
            return response.map((trip: any) => mapTripInfo(trip));

        } catch (error) {
            console.error("Error fetching trips:", error);
            return [];
        }
    }

    async deleteTripByTripid(firebaseUid: string, trip_id: string){

        const headers = new HttpHeaders({
            "Authorization": firebaseUid
        });

        let params = new HttpParams();
        params = params.set("trip_id", trip_id);

        try {
            // Make the HTTP GET request
            const response = await lastValueFrom(
                this.http.delete<any>("https://industrious-perfection-production.up.railway.app/trip/delete", { headers, params })
            );

            console.log("Raw response:", response); // Debugging

            // ✅ Check if API returned "No trips found"
            if (response?.response === "No trip deleted") {
                console.warn("No trips deleted. Returning an empty string.");
                return "";
            }

            
            return response.deleted_id as string;

        } catch (error) {
            console.error("Error deleteing trip", error);
            return "";
        }

    }

    async getTripInfoByTrip_id(trip_id: string, firebaseUid: string) {
    
            const headers = new HttpHeaders({
                "Authorization": firebaseUid
            });
    
            let params = new HttpParams();
            params = params.set("trip_id", trip_id);
    
            try {
                // Make the HTTP GET request
                const response = await lastValueFrom(
                    this.http.get<any>("https://industrious-perfection-production.up.railway.app/trip/get-trip", { headers, params })
                );
    
                console.log("Raw response:", response); // Debugging
    
    
                if (response?.response === "Error: No trip found") {
                    console.warn("No trip found. Returning an empty obj.");
                    return null;
                }
    
    
                // Map the response to LocationObj if the response structure matches
                const tripObj: TripInfo = {
                    trip_id: response.trip_id ?? "N/A",
                    trip_name: response.trip_name ?? "N/A",
                    start_date: response.start_date ?? "N/A",
                    end_date: response.end_date ?? "N/A",
                    destination_city: response.destination_city ?? "N/A",
                    destination_curr: response.destination_curr ?? "N/A",
                    destination_timezone: response.destination_timezone ?? "N/A",
                    d_timezone_name: response.d_timezone_name ?? "N/A",
                    d_iso2: response.d_iso2 ?? "N/A",
                    dest_lat: response.dest_lat ?? "N/A",
                    dest_lng: response.dest_lng ?? "N/A",
                    description_t: response.description_t ?? "N/A",
                    cover_image_id: response.cover_image_id ?? "N/A",
                    attendees: response.description_t ?? "N/A",
                    master_user_id: response.description_t ?? "N/A",
                    last_updated: response.last_updated ?? "N/A"
                };
    
                return tripObj;
    
            } catch (error) {
                console.error("Error fetching trip:", error);
                return null;
            }
    
        }




}
