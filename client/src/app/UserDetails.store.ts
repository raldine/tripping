import { inject, Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { UserFront } from "./models/models";
import { UserService } from "./UserService";
import { Observable, switchMap, tap } from "rxjs";



const INIT: UserFront = {
    user_id: null,
    user_name: '',
    firebase_uid: '',
    user_email: '',
    country_origin: '',
    timezone_origin: '',
    currency_origin: '',
    notif: false
}

@Injectable({
    providedIn: 'root'
})
export class UserDetailsStore extends ComponentStore<UserFront>{

    userService = inject(UserService);

    constructor(){
        super(INIT)
    }


    //set user when usr loggedin

      // UPDATERS
  readonly setUserDetails = this.updater((state, user: UserFront) => ({
    ...state,
    user_id: user.user_id,
    user_name: user.user_name,
    firebase_uid: user.firebase_uid,
    user_email: user.user_email,
    country_origin: user.country_origin,
    currency_origin: user.currency_origin,
    notif: user.notif
  }));


  //get user info
   // SELECTORS
   readonly userDetails$ = this.select((state) => state);


   // EFFECT to fetch user details from backend
  readonly loadUserDetails = this.effect((firebaseUid$: Observable<string>) => {
    return firebaseUid$.pipe(
      switchMap((firebaseUid) => this.userService.getUserbyFirebaseId(firebaseUid)), 
      tap((userDetails) => this.setUserDetails(userDetails)) 
    );
  });



}