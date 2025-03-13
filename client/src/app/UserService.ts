import { inject, Injectable } from "@angular/core";
import { UserFront } from "./models/models";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { user } from "@angular/fire/auth";
import { lastValueFrom } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class UserService{

    http = inject(HttpClient)
    registerUser(userInfo: UserFront): Promise<string> {
        console.info("calling register service");
        console.log("value of user is ", userInfo);
    
        return lastValueFrom(this.http.post<{ response: string }>("/api/register", userInfo))
            .then((response) => {
                console.info("Response received: ", response);
                return response.response; 
            })
            .catch(error => {
                console.error("Error during registration:", error);
                throw error;  // Re-throwing error after logging
            });
    }


    getUserbyFirebaseId(firebaseId: string): Promise<UserFront> {
        console.info("calling user service");
        console.log("firebaseuid of user is ", firebaseId);
           const headers = new HttpHeaders({
                'Authorization' : firebaseId
            }
            )

        return lastValueFrom(this.http.get<UserFront>(`/user/get-user/${firebaseId}`, { headers }))

    }

    getManyUserbyFirebaseId(firebaseIds: string[], firebaseUidOfRequester: string): Promise<UserFront[]> {
        console.info("calling user service");
        console.log("firebaseuid of user is ", firebaseIds);
           const headers = new HttpHeaders({
                'Authorization' : firebaseUidOfRequester
            }
            )
            const firebaseIdsParam = firebaseIds.join(',');

        return lastValueFrom(this.http.get<UserFront[]>(`/user/get-user/${firebaseIdsParam}`, { headers }))

    }

    
    
    

}