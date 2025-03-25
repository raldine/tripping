import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ItineraryObj, mapItineraryObj } from "./models/models";
import { BehaviorSubject, lastValueFrom } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ItineraryService {

    //for getting backend 
    http = inject(HttpClient)

    //for sharing itinerary with other components
    private oneItinerarySubject = new BehaviorSubject<ItineraryObj | null>(null);
    private AllItineraryForTrip = new BehaviorSubject<ItineraryObj[] | null>(null);

    //getting backend 
    async getAllItnByTripId(trip_id: string | null, firebaseUid: string): Promise<ItineraryObj[]> {
        const headers = new HttpHeaders({
            "Authorization": firebaseUid
        });

        let params = new HttpParams();
        if (trip_id !== null) {

            params = params.set("trip_id", trip_id)
        } else {
            return []
        }

        try {
            // Make the HTTP GET request
            const response = await lastValueFrom(
                this.http.get<any>("/api/itnry/itnrys-fromtrip", { headers, params })
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

    //passing from component to component
    //set
    setOneItinerary(itineraryOne: ItineraryObj | null) {
        this.oneItinerarySubject.next(itineraryOne);
    }


    setAllItineraryForTrip(allItinerary: ItineraryObj[] | null) {
        this.AllItineraryForTrip.next(allItinerary);
    }


    //get
    getOneItinerary(): ItineraryObj | null {
        return this.oneItinerarySubject.getValue();
    }

    getAllItineraryForTrip(): ItineraryObj[] | null {
        return this.AllItineraryForTrip.getValue();
    }

    getItineraryIdByDate(date: string): string | null {
        const allItineraries = this.AllItineraryForTrip.getValue();
        if (!allItineraries) return null;
    
        const found = allItineraries.find(itn => itn.itn_date === date);
        return found ? found.itinerary_id : null;
    }



}
            