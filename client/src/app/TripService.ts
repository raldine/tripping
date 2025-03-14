import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { FileUploadedInfo, TripInfo } from "./models/models";
import { lastValueFrom } from "rxjs";
import { ImageFetcherService } from "./ImageFetcherService";
import { FileUploadService } from "./FileUploadService";

@Injectable({
    providedIn: 'root'
})
export class TripService {
    //interacts with backend to add, delete , edit trip


    //for auto load trip cover image
    imageFetcherService = inject(ImageFetcherService)



    http = inject(HttpClient)

    async putNewTrip(tripInfo: TripInfo, firebase_uid: string): Promise<string> {
        console.info("calling add new trip service");
        console.log("value of trip is ", tripInfo);
        const headers = new HttpHeaders({
            'Authorization': firebase_uid
        })
    
        // Check if tripInfo has a custom cover image, otherwise fetch an image and upload
        if (tripInfo.cover_image_id == null || tripInfo.cover_image_id.match('')) {
            let query = tripInfo.destination_city;
            try {
                const photoUrl = await this.imageFetcherService.fetchRandomImage(query.replaceAll("-", " "));
                
                const data = {
                    comments: "cimage",
                    photourl: photoUrl,
                    trip_id: tripInfo.trip_id,
                    media_type: "image/*"
                }
    
                // Attempt to upload the image
                const fileUploadedInfo = await lastValueFrom(this.http.post<FileUploadedInfo>('/api/upload-pexel', data, { headers }));
    
                if (fileUploadedInfo && fileUploadedInfo.resource_id) {
                    tripInfo.cover_image_id = fileUploadedInfo.resource_id; // Assign the cover image ID
                } else {
                    console.warn('Image upload failed, no resource_id received.');
                    tripInfo.cover_image_id = ''; // Optional: set a default image ID
                }
    
            } catch (error) {
                console.error("Error fetching image", error);
                tripInfo.cover_image_id = ''; // Optional: set a fallback image ID on error
            }
        }
    
        // Continue with trip info submission to backend
        try {
            const response = await lastValueFrom(this.http.put<{ response: string }>("/trip/newtrip", tripInfo, { headers }));
            console.info("Response received: ", response);
            return response.response;
        } catch (error) {
            console.error("Error during adding trip:", error);
            throw error;  // Re-throwing error after logging
        }
    }
    



}