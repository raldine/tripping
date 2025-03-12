import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, catchError, map, Observable, tap, throwError } from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class GoogleApiCallService{

    googleMapsApi = new BehaviorSubject<string>("");  // Default value of null

  private http = inject(HttpClient);  // Using inject to inject HttpClient

  private get_google_map_url = "/api/googlekey";  // URL to your backend endpoint

  constructor() {}

  getGoogleMapApi(): Observable<string> {
    console.info("Service: Calling the backend to get API key...");

    return this.http.get<{ api_key: string }>(this.get_google_map_url)
      .pipe(
        tap(result => console.log("API key received:", result)), // Log full response
        map(result => result.api_key), // Extract "api_key"
        tap(apiKey => this.googleMapsApi.next(apiKey)), // Store API key
        catchError(error => {
          console.error("Error fetching API key:", error);
          return throwError(() => error);
        })
      );
  }

}