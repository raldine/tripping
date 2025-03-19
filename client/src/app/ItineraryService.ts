import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ItineraryObj, mapItineraryObj } from "./models/models";
import { lastValueFrom } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ItineraryService {

    http = inject(HttpClient)


        async getAllItnByTripId(trip_id: string | null, firebaseUid: string): Promise<ItineraryObj[] | null> {
            const headers = new HttpHeaders({
                "Authorization": firebaseUid
            });

            let params = new HttpParams();
            if(trip_id!==null){

                params = params.set("trip_id", trip_id)
            } else {
                return Promise.resolve(null)
            }
    
            try {
                // Make the HTTP GET request
                const response = await lastValueFrom(
                    this.http.get<any>("/api/itnry/itnrys-fromtrip",{ headers, params })
                );
    
                console.log("Raw response:", response); // Debugging
    
                // ✅ Check if API returned "No trips found"
                if (response?.response === "No itineraries found") {
                    console.warn("No itnrs found. Returning an empty array.");
                    return [];
                }
    
                
                return response.map((itn: any) => mapItineraryObj(itn));
    
            } catch (error) {
                console.error("Error fetching itnry:", error);
                return [];
            }
        }

}