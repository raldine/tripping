import { HttpClient, HttpHeaders } from "@angular/common/http";
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

    async putNewTrip(form: any, filebytes: Blob | null, firebase_uid: string) {
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
        formData.set("description_t", form["description_t"] ?? "N/A");
        formData.set("cover_image_id", form["cover_image_id"] ?? "N/A");
        formData.set("attendees", form["attendees"] ?? "N/A");
        formData.set("master_user_id", form["master_user_id"] ?? "N/A");

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
                this.http.put<{ response: string }>("/trip/newtrip", formData, { headers })
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
                this.http.get<any>("/trip/get-trips/" + firebaseUid, { headers })
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


}
