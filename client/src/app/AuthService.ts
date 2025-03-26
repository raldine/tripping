import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";

import { Auth, onAuthStateChanged, signOut, User } from '@angular/fire/auth'
import { Router } from "@angular/router";
import { BehaviorSubject, lastValueFrom, Observable } from "rxjs";
import { FirstAuth } from "./models/models";

@Injectable({
    providedIn: 'root'
})
export class AuthService {


    //this class is for further authentication with backend server and database

    private auth = inject(Auth);

    http = inject(HttpClient)

    router = inject(Router)

      //has become check user if existing or new to my database
      async getUserNewOrExisting(user: User) {

        console.log("user received is ", user)

        


        try {

          
            const response = await lastValueFrom(
              this.http.post<any>('https://industrious-perfection-production.up.railway.app/authen', {
                firebaseUid: user.uid,
                email: user.email ?? ''
              }));
                
            
                console.log("Raw response:", response); // Debugging
          
         
          
            // Access headers from the response
            const userStatus = response.userstatus
            const fullyRegistered = response.furtherReg
            console.log("this user is " + userStatus + "-" + fullyRegistered)
    
   
    
            return userStatus + "-" + fullyRegistered; 
        } catch (error) {
            console.error("Authentication failed ", error);
            throw error;  // Rethrow or handle the error
        }
     

    }


    logout(): void {
        signOut(this.auth)
          .then(() => {
            console.log('User signed out');
    
    
            // Redirect to login or home
            this.router.navigate(['/login']);
          })
          .catch((error) => {
            console.error('Logout failed:', error);
          });
      }
    notifyLogin(): void {
        this.http.post('https://industrious-perfection-production.up.railway.app/api/metrics/user-login', {}).subscribe();
      }


      notifyLogout(): void {
        this.http.post('https://industrious-perfection-production.up.railway.app/api/metrics/user-logout', {}).subscribe();
      }

}