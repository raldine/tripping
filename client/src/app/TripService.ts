import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { TripInfo } from "./models/models";
import { lastValueFrom } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class TripService {
    //interacts with backend to add, delete , edit trip


    http = inject(HttpClient)
    putNewTrip(tripInfo: TripInfo, firebase_uid: string): Promise<string> {
        console.info("calling add new trip service");
        console.log("value of trip is ", tripInfo);
        const headers = new HttpHeaders({
            'Authorization': firebase_uid
        }
        )

        return lastValueFrom(this.http.put<{ response: string }>("/trip/newtrip", tripInfo))
            .then((response) => {
                console.info("Response received: ", response);
                return response.response;
            })
            .catch(error => {
                console.error("Error during adding trip:", error);
                throw error;  // Re-throwing error after logging
            });
    }



}