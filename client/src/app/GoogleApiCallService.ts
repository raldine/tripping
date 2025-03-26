import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, catchError, firstValueFrom, map, Observable, tap, throwError } from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class GoogleApiCallService{

    googleMapsApi = new BehaviorSubject<string>("");  // Default value of null

  private http = inject(HttpClient);  // Using inject to inject HttpClient

  private get_google_map_url = "https://industrious-perfection-production.up.railway.app/api/googlekey";  // URL to your backend endpoint

  private apikey!: string

  constructor() {}

  getGoogleMapApi(): Observable<string> {
    console.info("Service: Calling the backend to get API key...");

    return this.http.get<{ api_key: string }>(this.get_google_map_url)
      .pipe(
        tap(result => console.log("API key received:", result)), // Log full response
        map(result => result.api_key), // Extract "api_key"
        tap(apiKey => 
        {
          this.googleMapsApi.next(apiKey as string)
        this.apikey = apiKey}), // Store API key
        catchError(error => {
          console.error("Error fetching API key:", error);
          return throwError(() => error);
        })
      );
  }

  async getPlaceGeometry(placeId: string): Promise<{ lat: string; lng: string } | null> {
        // Wait for the API key to be set before making the request
       
    const params = new HttpParams()
              .set("place_id", placeId)

    try {
      const response: any = await firstValueFrom(this.http.get<any>("https://industrious-perfection-production.up.railway.app/api/googlekey/getlatlng", { params }));


        if (response && response.result) {
          // ✅ Parse result if it's a string
          const parsedResult = typeof response.result === "string" ? JSON.parse(response.result) : response.result;
          
          const lat = parsedResult.lat;
          const lng = parsedResult.lng;
   
        return { lat, lng };
      } else {
        console.error('No geometry data found for place ID:', placeId);
        return null;
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  }

}