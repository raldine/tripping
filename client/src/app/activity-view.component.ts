import { ChangeDetectorRef, Component, inject, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'firebase/auth';
import { Subscription, Observable, firstValueFrom } from 'rxjs';
import { AccommodationService } from './AccommodationService';
import { DateFormatDayPipe } from './date-format-day.pipe';
import { DateFormatPipe } from './date-format.pipe';
import { FireBaseAuthStore } from './FireBaseAuth.store';
import { GoogleApiCallService } from './GoogleApiCallService';
import { LocationService } from './LocationService';
import { AccommodationObj, LocationObj, GooglePlaceInfo, TripInfo, AuthState, UserFront, ActivityObj } from './models/models';
import { TripStore } from './TripsStore.store';
import { UserDetailsStore } from './UserDetails.store';
import { UserService } from './UserService';
import { ActivityService } from './ActivityService';
import { getGoogleMapsSearchUrl } from './models/models';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UserROLESService } from './UserROLESService';
import { Title } from '@angular/platform-browser';

declare global {
  interface Window {
    // initAutocomplete: () => void;  // Add the initAutocomplete function to the window object
    initMap: () => void;
    google: any
  }
}

declare var google: any;

@Component({
  selector: 'app-activity-view',
  standalone: false,
  templateUrl: './activity-view.component.html',
  styleUrl: './activity-view.component.scss'
})
export class ActivityViewComponent {


  titleService = inject(Title);
      //always get from backend
  //CHECK USR ROLE AND SET MODE TO VIEW ONLY OR EDITABLE
  curr_user_role_in_trip!: string
  view_mode!: string
  userRolesService = inject(UserROLESService);



  //get accomm details to view
  activatedRoute = inject(ActivatedRoute)
  paramsSub!: Subscription;
  currentActivityToView!: ActivityObj | null;
  activity_selected_view_id!: string;
  activityService = inject(ActivityService)

  //this activity's location details
  locationService = inject(LocationService)
  activity_location_details!: LocationObj | null;
  getGoogleMapsSearchUrl = getGoogleMapsSearchUrl


  //to load google autocomplete
  autocomplete: any;
  private googleServiceApi = inject(GoogleApiCallService);
  api_key: string | null = null;  // Initial value is null

  //for map loading
  map!: any;
  marker!: any;

  //capture place details for container
  google_place_results!: GooglePlaceInfo;
  cdRef = inject(ChangeDetectorRef);
  zone = inject(NgZone)

  //format dates
  dataFormatDayPipe = inject(DateFormatDayPipe)
  dataFormatPipe = inject(DateFormatPipe)


  //to retrieve destination currency, timezone etc
  tripStore = inject(TripStore)
  ///track current selected trip details
  selected_trip_id!: string
  selected_tripInfo!: TripInfo | null
  selectedTripDetailsSub!: Subscription;

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
  userService = inject(UserService);

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


  //router to navigate
  router = inject(Router)

  //confirmation for deleting
  confirmationService = inject(ConfirmationService)
  messagingService = inject(MessageService);

  async ngOnInit(): Promise<void> {

    this.paramsSub = this.activatedRoute.params.subscribe(params => {
      this.activity_selected_view_id = params["act_id"];

    })


      this.titleService.setTitle('View Activity Details | Tripping');


    //get from service getter
    this.currentActivityToView = this.activityService.getOneActivitySet();

    //get from service getter
    this.activity_location_details = this.locationService.getOneLocationSet();

    this.selectedTripDetailsSub = await this.tripStore.selected_tripInfo$.subscribe(async (trip) => {
      this.selected_tripInfo = trip;
      this.selected_trip_id = trip?.trip_id ?? ''
      console.log("trip infoooo >>>>> ", this.selected_tripInfo)

    })

    this.authStateCaptured$ = this.firebaseAuthStore.getAuthState$
    this.authStateSubscription = this.authStateCaptured$.subscribe((authState) => {
      if (!authState.isAuthenticated) {
        this.router.navigate(['/unauthorized']); // Navigate to unauthorized page
        return; // Exit early if the user is not authenticated
      } else {
        if (authState.user && authState.user.uid) {
          console.log("user details loaded in component store");

          this.currUser = authState.user

        }

      }
    })

    //sub currentUserDetails
    this.loggedInUserDetailsSub = await this.userDetailsStore.userDetails$.subscribe((user) => {
      this.currUserDetails = { ...this.DEFAULT_USER, ...user }
      console.log("User details loaded:", this.currUserDetails);
    });


    try {
      console.info("Fetching Google API key...");
      this.api_key = await firstValueFrom(this.googleServiceApi.getGoogleMapApi());

      if (this.api_key) {
        console.info("Google API key received:", this.api_key);


        // ✅ Reload Google Maps script only if missing
        if (!window.google || !window.google.maps) {
          console.info("Google Maps script not found, loading...");
          // this.isUploading = true;
          await this.loadGoogleMapsScript(this.api_key);
        } else {
          console.info("Google Maps script already loaded.");
          // this.isUploading = false;
        }

        // ✅ Always reinitialize Autocomplete to avoid stale references
        // setTimeout(() => this.initAutocomplete(), 500);
        setTimeout(() => this.initMap(), 500);
      }
    } catch (err) {
      console.error("Error getting API key:", err);
    }

    if (this.activity_location_details !== null) {
      this.google_place_results = {
        location_id: this.activity_location_details.location_id,
        location_lat: this.activity_location_details.location_lat,
        location_lng: this.activity_location_details.location_lng,
        location_address: this.activity_location_details.location_address,
        location_name: this.activity_location_details.location_name,
        google_place_id: this.activity_location_details.google_place_id ?? 'N/A',
        g_opening_hrs: this.activity_location_details.g_opening_hrs,
        g_biz_number: this.activity_location_details.g_biz_number,
        g_biz_website: this.activity_location_details.g_biz_website
      }
    }

  //get this curr user's role
    this.curr_user_role_in_trip = await this.userRolesService.getCurrUserRoleInThisTrip(this.currUserDetails.firebase_uid, this.selected_trip_id);

    if(this.curr_user_role_in_trip==="Master"){
      this.view_mode = "Master"
    } else if(this.curr_user_role_in_trip==="Editor"){
      this.view_mode = "Editor"
    } else {
      this.view_mode = "Viewer"
    }

  }

  loadGoogleMapsScript(apiKey: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (document.getElementById('google-maps-script')) {
        resolve('Script already loaded');
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async&callback=initMap`;
      script.id = 'google-maps-script';
      script.async = true;
      script.defer = true;

      // window['initAutocomplete'] = this.initAutocomplete.bind(this);
      window['initMap'] = this.initMap.bind(this);

      script.onload = () => {
        resolve('Google Maps script loaded');
        // this.isUploading = false;
      };

      script.onerror = (error) => {
        reject(error);
      };

      document.head.appendChild(script);
    });
  }

  async initMap(): Promise<void> {
    if (!google || !google.maps) {
      console.error("Google Maps API not yet available.");
      return;
    }

    const lat = Number(this.selected_tripInfo?.dest_lat);
    const lng = Number(this.selected_tripInfo?.dest_lng);

    // this.isUploading = true;
    this.map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
      zoom: 14,
      center: { lat: lat, lng: lng }, //load map on destination country
      disableDefaultUI: true,
      mapId: "5c2605a866eb2323"
    });
    // this.isUploading = false;


    if (this.activity_location_details !== null) {

      const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
      const accomm_lat = Number(this.activity_location_details.location_lat)
      console.log(accomm_lat)
      const accomm_lng = Number(this.activity_location_details.location_lng)
      console.log(accomm_lng)
      const accommPostion = new google.maps.LatLng(accomm_lat, accomm_lng);
      console.log("activity position ", accommPostion)
      this.map.panTo(accommPostion)
      this.map.setZoom(16)
      this.marker = new AdvancedMarkerElement({
        map: this.map,
        position: accommPostion,
        title: this.activity_location_details.location_name ?? this.currentActivityToView?.event_name
      })
    }
  }

  getIconByActivityType(activity_type: string) {

    return this.activityService.getIconByName(activity_type);

  }

  deleteActivity(activity_id: string) {

    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this activity?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'Cancel',
      accept: async () => {
        const reply = await this.activityService.deleteActivityByActivityid(this.currUserDetails.firebase_uid, activity_id)
        if (reply !== "") {
          this.messagingService.add({
            severity: 'success',
            summary: 'Activity Deleted',
            detail: 'Your activity has been successfully deleted!',
            life: 3000,
          });

          // Wait for the toast to be visible before navigating (adjust timing if needed)
          await new Promise(resolve => setTimeout(resolve, 2000));
          //reset services
          this.activityService.setOneActivity(null);
          this.locationService.setOneLocation(null);
          this.router.navigate(["/trip-details", this.selected_trip_id]);
        }
      },
      reject: () => {
        // Optional: feedback on cancel
        this.messagingService.add({
          severity: 'info',
          summary: 'Cancelled',
          detail: 'Activity was not deleted'
        });
      }
    });

  }

  navigateBackToTripDetails() {

    //reset services
    this.activityService.setOneActivity(null);
    this.locationService.setOneLocation(null);

    this.router.navigate(["/trip-details", this.selected_trip_id]);
  }





}
