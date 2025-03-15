import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { User } from 'firebase/auth';
import { MenuItem } from 'primeng/api';
import { filter, map, Observable, Subscription } from 'rxjs';
import { FireBaseAuthStore } from './FireBaseAuth.store';
import { AuthState } from './models/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy{


   //for navbar
   items: MenuItem[] | undefined;

     //User Authentication info
     private firebaseAuthStore = inject(FireBaseAuthStore)
     protected authStateCaptured$!: Observable<AuthState>
     protected currUser!: User | null
     private authStateSubscription!: Subscription //so that component can keep listening if user still authenticated at any point
     user_pp_url!: string | null; //to edit google profile pic link
     //in component lifecycle
     //To track currUser changes
     private accessCurrUserDetailsSub!: Subscription

     //for unauthorised path and further path
     router = inject(Router)

     ngOnInit(): void {
      this.authStateCaptured$ = this.firebaseAuthStore.getAuthState$
      this.authStateSubscription = this.authStateCaptured$.subscribe((authState) => {
        if (!authState.isAuthenticated) {
          this.router.navigate(['/unauthorized']); // Navigate to unauthorized page
          return; // Exit early if the user is not authenticated
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





  
     }


     ngOnDestroy(): void {
       this.authStateSubscription.unsubscribe()
       this.accessCurrUserDetailsSub.unsubscribe()
     }



}
