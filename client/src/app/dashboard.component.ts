import { Component, Inject, inject, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from './AuthService';
import { filter, map, Observable, Subscription } from 'rxjs';
import { User } from 'firebase/auth';
import { FireBaseAuthStore } from './FireBaseAuth.store';
import { AuthState, TripInfo, UserFront } from './models/models';
import { Router } from '@angular/router';
import { MenuItem, PrimeIcons } from 'primeng/api';
import { v4 as uuidv4 } from 'uuid';
import { TripService } from './TripService';
import { FileUploadService } from './FileUploadService';
import { UserDetailsStore } from './UserDetails.store';
import { TripStore } from './TripsStore.store';


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




  //for page body header style
  bg_images: string[] = [
    "https://trippingresources.sgp1.cdn.digitaloceanspaces.com/webresources/background1.jpg",
    "https://trippingresources.sgp1.cdn.digitaloceanspaces.com/webresources/background2.jpg",
    "https://trippingresources.sgp1.cdn.digitaloceanspaces.com/webresources/background3.jpg"]

  //set header background
  bg_image: string = "";


  //randomly generating new trip ids
  generatedNewTripID!: string;


  //for getting trips belonging to current user
  tripService = inject(TripService);
  tripStore = inject(TripStore);
  tripsSubscription!: Subscription;
  tripsCreatedByUser!: TripInfo[]

  //retrieve trip cover iamge
  fileUploadService = inject(FileUploadService);
  // Cache for trip cover images
  tripCoverImages: { [key: string]: string } = {};

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


  async ngOnInit(): Promise<void> {
    this.authStateCaptured$ = this.firebaseAuthStore.getAuthState$
    this.authStateSubscription = this.authStateCaptured$.subscribe((authState) => {
      if (!authState.isAuthenticated) {
        this.router.navigate(['/unauthorized']); // Navigate to unauthorized page
        return; // Exit early if the user is not authenticated
      } else {
        if (authState.user && authState.user.uid) {
          this.userDetailsStore.loadUserDetails(authState.user.uid)
          console.log("user details loaded in component store");
          this.tripStore.loadTrips(authState.user.uid);
          console.log("users trips loaded in component store")

        }

      }
    })

    //sub currentUserDetails
    this.loggedInUserDetailsSub = this.userDetailsStore.userDetails$.subscribe((user) => {
      this.currUserDetails = { ...this.DEFAULT_USER, ...user };
      console.log("User details loaded:", this.currUserDetails);
    });

    this.tripsSubscription = this.tripStore.user_trips$.subscribe(async (trips) => {
      this.tripsCreatedByUser = trips;

      if (this.tripsCreatedByUser) {
        // Preload trip cover images
        for (const trip of this.tripsCreatedByUser) {
          this.tripCoverImages[trip.cover_image_id] = await this.getTripsCoverImage(trip.cover_image_id);
        }
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

  // Fetch cover image and store it
  async getTripsCoverImage(resourceId: string): Promise<string> {
    if (!resourceId) return ''; // Handle missing resourceId
    const imageUrl = await this.fileUploadService.getFileByResourceId(resourceId, this.currUser?.uid ?? '');
    return imageUrl?.do_url ?? '';
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

  navigateToItinerary(trip: TripInfo) {
    this.tripStore.setSelectedTripInfo(trip);
    this.router.navigate(["/trip-details", trip.trip_id]);
  }

  ngOnDestroy(): void {
    this.authStateSubscription.unsubscribe()
    this.accessCurrUserDetailsSub.unsubscribe()
    this.loggedInUserDetailsSub.unsubscribe();
  }

}
