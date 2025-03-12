import { HttpClient, HttpResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";

import { Auth, onAuthStateChanged, signOut, User } from '@angular/fire/auth'
import { BehaviorSubject, lastValueFrom, Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class AuthService {


    //this class is for further authentication with backend server and database

    private auth = inject(Auth);

    http = inject(HttpClient)

      //has become check user if existing or new to my database
      async getUserNewOrExisting(user: User) {
        try {
            const response: HttpResponse<any> = await lastValueFrom(
                this.http.post('/authen', {},
                    {
                        headers: {
                            "firebaseUid": user.uid,
                            "email": user.email as string
                        }
                    ,
                        observe: 'response'
                    })
            );
            
            // // Extract JWT from the response body
            // const jwtToken = response.body as string; 
            const responeBody = response.body as string;
            console.log("response body is " +  responeBody)
            // Access headers from the response
            const userStatus = response.headers.get('userstatus');
            const fullyRegistered = response.headers.get('furtherReg')
            console.log("this user is " + userStatus + "-" + fullyRegistered)
    
            // console.log("Server response:", jwtToken);
    
            // localStorage.setItem('jwtToken', jwtToken);
            // console.log("jwt set");
    
            return userStatus + "-" + fullyRegistered; 
        } catch (error) {
            console.error("Authentication failed ", error);
            throw error;  // Rethrow or handle the error
        }
     

    }


}