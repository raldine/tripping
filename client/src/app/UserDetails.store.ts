import { inject, Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { UserFront } from "./models/models";
import { UserService } from "./UserService";
import { Observable, switchMap, tap, catchError, of, from } from "rxjs";

const INIT: Partial<UserFront> = {}; // ✅ Use an empty object instead of `null`

@Injectable({
    providedIn: 'root'
})
export class UserDetailsStore extends ComponentStore<Partial<UserFront>> { // ✅ Use Partial<UserFront>

    userService = inject(UserService);

    constructor() {
        super(INIT); // ✅ Initialize with an empty object
    }

    // ✅ Ensure Updater always receives an object, never `null`
    readonly setUserDetails = this.updater((state, user: Partial<UserFront>) => ({
        ...state, 
        ...user
    }));

    // ✅ Selector remains unchanged
    readonly userDetails$ = this.select((state) => state);

    // ✅ Effect to load user details, handling errors safely
    readonly loadUserDetails = this.effect((firebaseUid$: Observable<string>) => {
        return firebaseUid$.pipe(
            switchMap((firebaseUid) => 
                from(this.userService.getUserbyFirebaseId(firebaseUid)).pipe( // ✅ Convert Promise to Observable
                    catchError((error) => {
                        console.error("Error loading user:", error);
                        return of({}); // ✅ Return an empty object instead of `null`
                    })
                )
            ),
            tap((userDetails) => this.setUserDetails(userDetails || {})) // ✅ Ensure we never pass `null`
        );
    });
}
