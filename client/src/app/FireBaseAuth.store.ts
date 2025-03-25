import { inject, Injectable } from "@angular/core";
import { ComponentStore } from '@ngrx/component-store'
import { AuthState } from "./models/models";
import { Auth, User } from "@angular/fire/auth";
import { AuthService } from "./AuthService";
import { BehaviorSubject } from "rxjs";

const INIT: AuthState = {
    user: null,
    isAuthenticated: false,
    loading: false

}


@Injectable({
    providedIn: 'root'
})
export class FireBaseAuthStore extends ComponentStore<AuthState> {

    authService = inject(AuthService)

    private firebaseReady = new BehaviorSubject<boolean>(false);
firebaseReady$ = this.firebaseReady.asObservable();

    private hasSeenAuthenticatedUser = false; 
    constructor(private auth: Auth) {
        super({ user: null, isAuthenticated: false, loading: false });
      

        // Subscribe to Firebase authentication state changes
        this.auth.onAuthStateChanged((user) => {
            this.setState((state) => ({
                ...state,
                user,
                isAuthenticated: !!user,
                  //Logic is if user is null then isAuthenticate is false as user does not exist (is null)
            }));
            this.firebaseReady.next(true);

              // Trigger backend notification
       // 🔐 Only notify login once per real login
       if (user && !this.hasSeenAuthenticatedUser) {
        this.authService.notifyLogin();
        this.hasSeenAuthenticatedUser = true;
      }

      // Only notify logout if user was previously logged in
      if (!user && this.hasSeenAuthenticatedUser) {
        this.authService.notifyLogout();
        this.hasSeenAuthenticatedUser = false;
      }
        });
    }

    //selector to check current AuthState
    readonly getAuthState$ = this.select((state) => state);

    //updater to change AuthState (for successful login and to start logout)
    readonly setAuthState = this.updater((state, user: User | null) => ({
        ...state,
        user,
        isAuthenticated: !!user,
        loading: false, // Ensure loading is properly updated when auth state change when LOGIN AND LOGOUT stops (PREVENT UI HANG)
    }));


    // Action to update loading state (to prevent UI hang when auth state changing - LOGIN LOGOUT in progress)
    readonly setLoading = this.updater((state, loading: boolean) => ({
        ...state,
        loading,
    }));



}
