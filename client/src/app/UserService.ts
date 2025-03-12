import { inject, Injectable } from "@angular/core";
import { UserFront } from "./models/models";
import { HttpClient } from "@angular/common/http";
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
    
    

}