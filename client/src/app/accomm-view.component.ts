import { ChangeDetectorRef, Component, inject, NgZone, OnInit } from '@angular/core';
import { AccommodationObj, AuthState, GooglePlaceInfo, LocationObj, TripInfo, UserFront } from './models/models';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, Observable, Subscription } from 'rxjs';
import { GoogleApiCallService } from './GoogleApiCallService';
import { TripStore } from './TripsStore.store';
import { DateFormatDayPipe } from './date-format-day.pipe';
import { DateFormatPipe } from './date-format.pipe';
import { FireBaseAuthStore } from './FireBaseAuth.store';
import { User } from 'firebase/auth';
import { UserDetailsStore } from './UserDetails.store';
import { UserService } from './UserService';
import { AccommodationService } from './AccommodationService';
import { LocationService } from './LocationService';
import { getGoogleMapsSearchUrl } from './models/models';

declare global {
  interface Window {
    // initAutocomplete: () => void;  // Add the initAutocomplete function to the window object
    initMap: () => void;
    google: any
  }
}

declare var google: any;

@Component({
  selector: 'app-accomm-view',
  standalone: false,
  templateUrl: './accomm-view.component.html',
  styleUrl: './accomm-view.component.scss'
})
export class AccommViewComponent implements OnInit {


  //get accomm details to view
  activatedRoute = inject(ActivatedRoute)
  paramsSub!: Subscription;
  currentAccToView!: AccommodationObj | null;
  accomm_selected_view_id!: string;
  accommService = inject(AccommodationService)

  //this accomm's location details
  locationService = inject(LocationService)
  accomm_location_details!: LocationObj | null;
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



  async ngOnInit(): Promise<void> {

    this.paramsSub = this.activatedRoute.params.subscribe(params => {
      this.accomm_selected_view_id = params["acc_id"];

    })

    //get from service getter
    this.currentAccToView = this.accommService.getOneAccommSet();

    //get from service getter
    this.accomm_location_details = this.locationService.getOneLocationSet();

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

    if (this.accomm_location_details !== null) {
      this.google_place_results = {
        location_id: this.accomm_location_details.location_id,
        location_lat: this.accomm_location_details.location_lat,
        location_lng: this.accomm_location_details.location_lng,
        location_address: this.accomm_location_details.location_address,
        location_name: this.accomm_location_details.location_name,
        google_place_id: this.accomm_location_details.google_place_id,
        g_opening_hrs: this.accomm_location_details.g_opening_hrs,
        g_biz_number: this.accomm_location_details.g_biz_number,
        g_biz_website: this.accomm_location_details.g_biz_website
      }
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


    if (this.accomm_location_details !== null) {

      const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
      const accomm_lat = Number(this.accomm_location_details.location_lat)
      console.log(accomm_lat)
      const accomm_lng = Number(this.accomm_location_details.location_lng)
      console.log(accomm_lng)
      const accommPostion = new google.maps.LatLng(accomm_lat, accomm_lng);
      console.log("accomm position ", accommPostion)
      this.map.panTo(accommPostion)
      this.map.setZoom(16)
      this.marker = new AdvancedMarkerElement({
        map: this.map,
        position: accommPostion,
        title: this.accomm_location_details.location_name ?? this.currentAccToView?.accommodation_name
      })
    }




  }


  navigateBackToTripDetails(){

    //reset services
    this.accommService.setOneAccommObj(null);
    this.locationService.setOneLocation(null);

    this.router.navigate(["/trip-details", this.selected_trip_id]);
  }





  ngOnDestroy(): void {
    this.authStateSubscription.unsubscribe();
    this.loggedInUserDetailsSub.unsubscribe();
    this.selectedTripDetailsSub.unsubscribe();
    this.paramsSub.unsubscribe();


  }


}
