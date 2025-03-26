import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, lastValueFrom } from "rxjs";
import { LocationObj, mapLocationObj } from "./models/models";


@Injectable({
    providedIn: "root"
})
export class LocationService {

    http = inject(HttpClient);

    //for sharing itinerary with other components
        private oneLocationSubject = new BehaviorSubject<LocationObj | null>(null);
        private allLocationsForTripSubject = new BehaviorSubject<LocationObj[] | null>(null);

    async getLocationObjFromLocationId(location_id: string, firebaseUid: string) {

        const headers = new HttpHeaders({
            "Authorization": firebaseUid
        });

        let params = new HttpParams();
        params = params.set("location_id", location_id);

        try {
            // Make the HTTP GET request
            const response = await lastValueFrom(
                this.http.get<any>("https://industrious-perfection-production.up.railway.app/api/locations/get-location", { headers, params })
            );

            console.log("Raw response:", response); // Debugging


            if (response?.response === "Error: No location found") {
                console.warn("No location found. Returning an empty location.");
                return null;
            }


            // Map the response to LocationObj if the response structure matches
            const locationObj: LocationObj = {
                location_id: response.location_id ?? "N/A",
                location_lat: response.location_lat ?? "N/A",
                location_lng: response.location_lng ?? "N/A",
                location_address: response.location_address ?? "N/A",
                location_name: response.location_name ?? "N/A",
                google_place_id: response.google_place_id ?? "N/A",
                g_biz_number: response.g_biz_number ?? "N/A",
                g_biz_website: response.g_biz_website ?? "N/A",
                g_opening_hrs: response.g_opening_hrs ?? ["N/A"],
                trip_id: response.trip_id ?? "N/A",
                itinerary_id: response.itinerary_id ?? "N/A",
                last_updated: response.last_updated ?? "N/A"
            };

            return locationObj;

        } catch (error) {
            console.error("Error fetching location:", error);
            return null;
        }

    }

    //passing from component to component
        //set
        setOneLocation(oneLocation: LocationObj | null) {
            this.oneLocationSubject.next(oneLocation);
        }
    
    
        setAllLocationsForTrip(allLocations: LocationObj[] | null) {
            this.allLocationsForTripSubject.next(allLocations);
            console.log("stored in service ", this.allLocationsForTripSubject.getValue())
        }
    
    
        //get
        getOneLocationSet(): LocationObj | null {
            return this.oneLocationSubject.getValue();
        }
    
        getAllLocationsForTrip(): LocationObj[] | null {
            return this.allLocationsForTripSubject.getValue();
        }

        getOneLocationFromCurrentAllLocationsForTrip(location_id: string): LocationObj | null {
            const currentLocations = this.allLocationsForTripSubject.getValue();
            if (currentLocations) {
                const location = currentLocations.find(loc => loc.location_id === location_id);
                console.log('Found location:', location);  // Debug log for found location
                return location ?? null;
            }
            return null;
        }

          async getAllLocationsFromTripId(trip_id: string, firebaseUid: string) {
        
                const headers = new HttpHeaders({
                    "Authorization": firebaseUid
                });
        
                let params = new HttpParams();
                params = params.set("trip_id", trip_id);
        
                try {
                    // Make the HTTP GET request
                    const response = await lastValueFrom(
                        this.http.get<any>("https://industrious-perfection-production.up.railway.app/api/locations/get-all-locations", { headers, params })
                    );
        
                    console.log("Raw response:", response); // Debugging
        
        
                    if (response?.response === "No locations found") {
                        console.warn("No locations found. Returning an empty array.");
                        return [];
                    }
        
        
                    return response.map((location: any) => mapLocationObj(location));
        
                } catch (error) {
                    console.error("Error fetching locations:", error);
                    return [];
                }
        
            }
        

}