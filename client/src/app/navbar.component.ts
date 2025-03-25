import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { User } from 'firebase/auth';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { filter, map, Observable, Subscription } from 'rxjs';
import { FireBaseAuthStore } from './FireBaseAuth.store';
import { AuthState, UserFront } from './models/models';
import { Router } from '@angular/router';
import { UserDetailsStore } from './UserDetails.store';
import { AuthService } from './AuthService';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {


  //for navbar
  items: MenuItem[] | undefined;

  //for logout
  authService = inject(AuthService)

  //User Authentication info
  private firebaseAuthStore = inject(FireBaseAuthStore)
  protected authStateCaptured$!: Observable<AuthState>
  protected currUser!: User | null
  private authStateSubscription!: Subscription //so that component can keep listening if user still authenticated at any point
  user_pp_url!: string | null; //to edit google profile pic link
  //in component lifecycle
  //To track currUser changes
  private accessCurrUserDetailsSub!: Subscription

  //to track user details from my backend
  private userDetailsStore = inject(UserDetailsStore);
  private loggedInUserDetailsSub!: Subscription;
  protected currUserDetails!: UserFront
  // Default user structure (fallback)
  DEFAULT_USER: UserFront = {
    user_id: null,
    user_name: '',
    firebase_uid: '',
    user_email: '',
    country_origin: '',
    timezone_origin: '',
    currency_origin: '',
    notif: false
  };


  //for unauthorised path and further path
  router = inject(Router)

    //confirmation for deleting
    confirmationService = inject(ConfirmationService)
    messagingService = inject(MessageService);

  ngOnInit(): void {
    this.authStateCaptured$ = this.firebaseAuthStore.getAuthState$
    this.authStateSubscription = this.authStateCaptured$.subscribe((authState) => {
      if (!authState.isAuthenticated) {
        this.router.navigate(['/unauthorized']); // Navigate to unauthorized page
        return; // Exit early if the user is not authenticated
      } else if (authState.user && authState.user.uid) {
        this.userDetailsStore.loadUserDetails(authState.user.uid)
        console.log("user details loaded");
      }
    })

    //init nav bar
    this.items = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        routerLink: '/dashboard'
      },
      //to add more to nav if needed
    ];


    //get user details
    this.accessCurrUserDetailsSub = this.firebaseAuthStore.getAuthState$.pipe(
      map((authState) => authState.user),
      filter((user): user is User => user !== null)
    ).subscribe((user) => {
      this.currUser = user;  // Store the user object in the component


      this.user_pp_url = user.photoURL?.toString().replace("=s96-c", "") ?? null;
      console.log("current profile pic", this.user_pp_url)
      //also assign user to newTripform as master user and attendee
    });


    //sub currentUserDetails
    this.loggedInUserDetailsSub = this.userDetailsStore.userDetails$.subscribe((user) => {
      this.currUserDetails = {...this.DEFAULT_USER, ...user}
      console.log("User details loaded:", this.currUserDetails);
    });



  }

  logout() {

    this.confirmationService.confirm({
      message: 'Are you sure you want to logout?',
      header: 'Confirm Logout',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'Cancel',
      accept: async () => {

            //reset services
            this.authService.logout();
                  // Wait for the toast to be visible before navigating (adjust timing if needed)
        
       
          this.messagingService.add({
            severity: 'success',
            summary: 'Logged Out',
            detail: 'You have been successfully logged out!',
            life: 3000,
          });
          await new Promise(resolve => setTimeout(resolve, 3000));
          // Wait for the toast to be visible before navigating (adjust timing if needed)
      
        
          this.router.navigate(["/login"]);
        
      },
      reject: () => {
        // Optional: feedback on cancel

      }
    });
  
  }


  ngOnDestroy(): void {
    this.authStateSubscription.unsubscribe()
    this.accessCurrUserDetailsSub.unsubscribe()
  }



}
