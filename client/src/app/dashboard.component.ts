import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from './AuthService';
import { filter, map, Observable, Subscription } from 'rxjs';
import { User } from 'firebase/auth';
import { FireBaseAuthStore } from './FireBaseAuth.store';
import { AuthState } from './models/models';
import { Router } from '@angular/router';
import { MenuItem, PrimeIcons } from 'primeng/api';
import { v4 as uuidv4 } from 'uuid';


@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {

  //User Authentication info
  private firebaseAuthStore = inject(FireBaseAuthStore)
  protected authStateCaptured$!: Observable<AuthState>
  protected currUser!: User | null
  private authStateSubscription!: Subscription //so that component can keep listening if user still authenticated at any point
  user_pp_url!: string | null; //to edit google profile pic link
  //in component lifecycle
  //To track currUser changes
  private accessCurrUserDetailsSub!: Subscription

  private router = inject(Router)




  //for page body header style
  bg_images: string[] = [
    "https://trippingresources.sgp1.cdn.digitaloceanspaces.com/webresources/background1.jpg",
    "https://trippingresources.sgp1.cdn.digitaloceanspaces.com/webresources/background2.jpg",
    "https://trippingresources.sgp1.cdn.digitaloceanspaces.com/webresources/background3.jpg"]

  //set header background
  bg_image: string = "";


  //randomly generating new trip ids
  generatedNewTripID!: string;

  //for action submenubar
  nestedMenuItems = [
    {
      label: 'Add a New Trip',
      icon: PrimeIcons.PLUS,
      routerLink: () => [`/addedittrip`, this.generatedNewTripID]
      // items: [
      //     {
      //         label: 'New',
      //         icon: 'pi pi-fw pi-user-plus',
      //         items: [
      //             {
      //                 label: 'Customer',
      //                 icon: 'pi pi-fw pi-plus'
      //             },
      //             {
      //                 label: 'Duplicate',
      //                 icon: 'pi pi-fw pi-copy'
      //             }
      //         ]
      //     },
      //     {
      //         label: 'Edit',
      //         icon: 'pi pi-fw pi-user-edit'
      //     }
      // ]
    }]


  ngOnInit(): void {
    this.authStateCaptured$ = this.firebaseAuthStore.getAuthState$
    this.authStateSubscription = this.authStateCaptured$.subscribe((authState) => {
      if (!authState.isAuthenticated) {
        this.router.navigate(['/unauthorized']); // Navigate to unauthorized page
        return; // Exit early if the user is not authenticated
      }
    })

    //randomly generate new trip id
    this.generatedNewTripID = this.generateUUID();

    //randomly assign bg-image-header
    this.bg_image = this.getRandomElement(this.bg_images);

    this.accessCurrUserDetailsSub = this.firebaseAuthStore.getAuthState$.pipe(
      map((authState) => authState.user),
      filter((user): user is User => user !== null)
    ).subscribe(async (user) => {
      this.currUser = user;  // Store the user object in the component

      //extract or assign user details to this components local var
      this.user_pp_url = await user.photoURL?.toString().replace("=s96-c", "") ?? null;

      console.log('Current user:', this.currUser);
    });




  }

  getRandomElement(arr: string[]): string {
    if (arr.length === 0) return ''; // Handle empty array case
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
  }

  generateUUID(): string {
    const newUUID = uuidv4().replaceAll("-", "").substring(0, 24);
    const tripID = "trip" + newUUID;
    console.log(newUUID);
    return tripID;
  }

  ngOnDestroy(): void {
    this.authStateSubscription.unsubscribe()
    this.accessCurrUserDetailsSub.unsubscribe()
  }

}
