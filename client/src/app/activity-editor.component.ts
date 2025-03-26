import { ChangeDetectorRef, Component, inject, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'firebase/auth';
import { firstValueFrom, Observable, Subscription } from 'rxjs';
import { DateFormatDayPipe } from './date-format-day.pipe';
import { DateFormatPipe } from './date-format.pipe';
import { FireBaseAuthStore } from './FireBaseAuth.store';
import { GoogleApiCallService } from './GoogleApiCallService';
import { ItineraryService } from './ItineraryService';
import { GooglePlaceInfo, TripInfo, ItineraryObj, AuthState, UserFront, TimeZoneSelectItem } from './models/models';
import { TripStore } from './TripsStore.store';
import { UserDetailsStore } from './UserDetails.store';
import { UserService } from './UserService';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { v4 as uuidv4 } from 'uuid';
import { ActivityService } from './ActivityService';



declare global {
  interface Window {
    initAutocomplete: () => void;  // Add the initAutocomplete function to the window object
    initMap: () => void;
    google: any
  }
}

declare var google: any;


@Component({
  selector: 'app-activity-editor',
  standalone: false,
  templateUrl: './activity-editor.component.html',
  styleUrl: './activity-editor.component.scss'
})
export class ActivityEditorComponent {

  activatedRoute = inject(ActivatedRoute)
  paramsSub!: Subscription;
  activity_id_generated!: string;

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


  //to retrieve destination currency, timezone etc
  tripStore = inject(TripStore)
  ///track current selected trip details
  selected_trip_id!: string
  selected_tripInfo!: TripInfo | null
  selectedTripDetailsSub!: Subscription;
  //min and max dates
  min_date!: string
  max_date!: string


  //get itinerary info
  itineraryService = inject(ItineraryService);
  itinerary_array: ItineraryObj[] | null = [];
  dataFormatDayPipe = inject(DateFormatDayPipe)
  dataFormatPipe = inject(DateFormatPipe)
  initDateOptionsFromItn!: string[] | null;
  CURR_DAY_ITN_INFO!: ItineraryObj | null;

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

  private router = inject(Router)

  //init form
  fb = inject(FormBuilder)
  activityForm!: FormGroup
  locationId_generated!: string

  //for timezone options
  timezones: TimeZoneSelectItem[] = []

  //submit activity
  activityService = inject(ActivityService);

  //icons 
  activityTypesOptions = this.activityService.getActivityTypeNames();
  curr_selected_activity_type!: string

  //error uploading toast
  messagingService = inject(MessageService);

  // check_in_flight_mode: boolean = false;
  activityTypeSub!: Subscription | undefined



  isUploading = false;  // Flag to control the spinner visibility

  async ngOnInit(): Promise<void> {
    this.paramsSub = this.activatedRoute.params.subscribe(params => {
      this.activity_id_generated = params["act_id"];

    })

    this.selectedTripDetailsSub = await this.tripStore.selected_tripInfo$.subscribe(async (trip) => {
      this.selected_tripInfo = trip;
      this.selected_trip_id = trip?.trip_id ?? ''
      console.log("trip infoooo >>>>> ", this.selected_tripInfo)

    })

    //sub currentUserDetails
    this.loggedInUserDetailsSub = await this.userDetailsStore.userDetails$.subscribe((user) => {
      this.currUserDetails = { ...this.DEFAULT_USER, ...user }
      console.log("User details loaded:", this.currUserDetails);
    });


    if (this.selected_tripInfo?.d_timezone_name !== 'N/A' &&
      this.selected_tripInfo?.destination_timezone !== 'N/A') {

      if (this.selected_tripInfo?.d_timezone_name === "Unknown Timezone") {
        this.timezones.push(
          {
            name: `${this.selected_tripInfo?.destination_city} Time (${this.selected_tripInfo?.destination_timezone})`,
            code: `${this.selected_tripInfo?.destination_city} Time  (${this.selected_tripInfo?.destination_timezone})`
          })

      } else {
        this.timezones.push(
          {
            name: `${this.selected_tripInfo?.d_timezone_name} (${this.selected_tripInfo?.destination_timezone})`,
            code: `${this.selected_tripInfo?.d_timezone_name} (${this.selected_tripInfo?.destination_timezone})`
          })

      }

    }

    if (this.currUserDetails?.timezone_origin !== 'N/A' &&
      this.currUserDetails?.country_origin !== 'N/A') {
      this.timezones.push({
        name: `${this.currUserDetails?.country_origin} (${this.currUserDetails?.timezone_origin})`,
        code: `${this.currUserDetails?.country_origin} (${this.currUserDetails?.timezone_origin})`
      })
    }

    console.log("OPTIONS NOWWWWWW >>>>> ", this.timezones)

    this.locationId_generated = this.generateLocationUUID();

    this.itinerary_array = this.itineraryService.getAllItineraryForTrip();
    //get CURRENT DAY itinerary info
    // this.CURR_DAY_ITN_INFO = this.itineraryService.getOneItinerary();


    if (this.itinerary_array && this.itinerary_array?.length > 0) {
      this.initDateOptionsFromItn = this.itinerary_array.map((itinerary) => (
        `${this.dataFormatDayPipe.transform(itinerary.itn_date)}`
      ));
    }

    //to build form here:
    //init form
    this.activityForm = this.fb.group(
      {
        activity_id: this.fb.control<string>(this.activity_id_generated),
        trip_id: this.fb.control<string>(this.selected_trip_id),
        itinerary_id: this.fb.control<string>(''),
        event_name: this.fb.control<string>(''),
        activity_type: this.fb.control<string>(''),
        start_date: this.fb.control<string>(''),
        end_date: this.fb.control<string>(''),
        start_time: this.fb.control<string>(''),
        end_time: this.fb.control<string>(''),
        timezone_time: this.fb.control<string>(this.timezones[0].code ?? ''),
        event_notes: this.fb.control<string>(''),
        location_id: this.fb.control<string>(this.locationId_generated),
        location_lat: this.fb.control<string>('N/A'),
        location_lng: this.fb.control<string>('N/A'),
        location_address: this.fb.control<string>(''),
        location_name: this.fb.control<string>('N/A'),
        google_place_id: this.fb.control<string>('N/A'),
        g_biz_number: this.fb.control<string>('N/A'),
        g_biz_website: this.fb.control<string>('N/A'),
        g_opening_hrs: this.fb.control<string[]>(['N/A'])
      }
    )


    //set calendar limits:
    this.min_date = this.selected_tripInfo?.start_date ?? ''
    this.max_date = this.selected_tripInfo?.end_date ?? ''

    this.activityTypeSub = this.activityForm.get('activity_type')?.valueChanges.subscribe((value: string) => {
      console.log('Selected activity type:', value);
    
      if (value === 'Check In - Flight') {
        this.setAutocompleteRestrictions(null); // No restriction
      } else {
        const code = this.selected_tripInfo?.d_iso2?.trim();
        this.setAutocompleteRestrictions(code ? [code] : null);
      }
    });

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








    //get google api key before form loads
    try {
      console.info("Fetching Google API key...");
      this.api_key = await firstValueFrom(this.googleServiceApi.getGoogleMapApi());

      if (this.api_key) {
        console.info("Google API key received:", this.api_key);


        // ✅ Reload Google Maps script only if missing
        if (!window.google || !window.google.maps) {
          console.info("Google Maps script not found, loading...");
          this.isUploading = true;
          await this.loadGoogleMapsScript(this.api_key);
        } else {
          console.info("Google Maps script already loaded.");
          this.isUploading = false;
        }

        // ✅ Always reinitialize Autocomplete to avoid stale references
        setTimeout(() => this.initAutocomplete(), 500);
        setTimeout(() => this.initMap(), 500);
      }
    } catch (err) {
      console.error("Error getting API key:", err);
    }





  }

  loadGoogleMapsScript(apiKey: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (document.getElementById('google-maps-script')) {
        resolve('Script already loaded');
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async&callback=initAutocomplete`;
      script.id = 'google-maps-script';
      script.async = true;
      script.defer = true;

      window['initAutocomplete'] = this.initAutocomplete.bind(this);
      window['initMap'] = this.initMap.bind(this);

      script.onload = () => {
        resolve('Google Maps script loaded');
        this.isUploading = false;
      };

      script.onerror = (error) => {
        reject(error);
      };

      document.head.appendChild(script);
    });
  }

  initAutocomplete(): void {
    if (!google || !google.maps || !google.maps.places) {
      console.error("Google Maps API not loaded yet. Retrying...");
      setTimeout(() => this.initAutocomplete(), 500); // Retry after 500ms
      return;
    }

    const originInputElement = document.getElementById('accAddress') as HTMLInputElement;
    if (originInputElement && google) {
      this.autocomplete = new google.maps.places.Autocomplete(originInputElement, {

      });

      this.autocomplete.setComponentRestrictions({
        country: [this.selected_tripInfo?.d_iso2 ?? ''],
      });
      console.info("Initializing Google Autocomplete...");

      // ✅ Destroy the previous instance before reinitializing
      if (this.autocomplete) {
        google.maps.event.clearInstanceListeners(this.autocomplete);
        this.autocomplete = null;
      }

      // ✅ Initialize a new Autocomplete instance
      this.autocomplete = new google.maps.places.Autocomplete(originInputElement, {
        componentRestrictions: { country: this.selected_tripInfo?.d_iso2 }
      });

      this.autocomplete?.addListener('place_changed', async () => {
        const place = this.autocomplete?.getPlace();
        if (place && place.name && place.formatted_address && place.geometry) {
          console.log('Selected Place: ', place.name);
          console.log("WHOLE PLACE OBJECT", place)


          const location = place.geometry.location;

          const newPosition = new google.maps.LatLng(location.lat(), location.lng());
          const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
          // ✅ Update or create marker
          if (!this.marker) {
            this.marker = new AdvancedMarkerElement({
              map: this.map,
              position: newPosition,
              title: place.name
            });

            this.map.panTo(newPosition)
            this.map.setZoom(16)
          } else {
            this.marker.title = place.name
            this.marker.position = newPosition
            this.map.panTo(newPosition)
            this.map.setZoom(16)
          }

          let opening_hours_if_have: string[] = []

          if (place.current_opening_hours) {
            opening_hours_if_have = place.current_opening_hours.weekday_text ?? 'N/A'
          } else if (place.opening_hours) {
            opening_hours_if_have = place.opening_hours.weekday_text ?? 'N/A'

          }

          this.google_place_results = {
            location_id: null,
            location_lat: location.lat().toString() ?? 'N/A',
            location_lng: location.lng().toString() ?? 'N/A',
            location_address: place.formatted_address ?? 'N/A',
            location_name: place.name ?? 'N/A',
            google_place_id: place.place_id ?? 'N/A',
            g_opening_hrs: opening_hours_if_have ?? ['N/A'],
            g_biz_number: place.formatted_phone_number ?? place.international_phone_number ?? 'N/A',
            g_biz_website: place.website ?? 'N/A'
          }



          console.log("CURRENT LOCAITON OBJECT IS ", this.google_place_results)
          // Ensure that change detection happens after the Google Maps API is done
          this.zone.run(() => {
            this.cdRef.detectChanges();
          });
        }

      });
    }

  }

  async initMap(): Promise<void> {
    if (!google || !google.maps) {
      console.error("Google Maps API not yet available.");
      return;
    }

    const lat = Number(this.selected_tripInfo?.dest_lat);
    const lng = Number(this.selected_tripInfo?.dest_lng);

    this.isUploading = true;
    this.map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
      zoom: 14,
      center: { lat: lat, lng: lng }, //load map on destination country
      disableDefaultUI: true,
      mapId: "5c2605a866eb2323"
    });
    this.isUploading = false;





  }


  // changeCurrSelectedActivity(value: Event | null){
  //   const selectedValue = (event.target as HTMLSelectElement).value;
  //   console.log("event value ", selectedValue)
  //   // this.curr_selected_activity_type = event
  //   if(selectedValue===null){
  //     return
  //   }

  //   // if(selectedValue==="Check In - Flight"){
  //   //   console.log("settting no country restrictions")
  //   //   this.autocomplete.setComponentRestrictions({});
  //   // } else {
  //   //   this.autocomplete.setComponentRestrictions({country: this.selected_tripInfo?.d_iso2})
  //   // }

  // }

  setAutocompleteRestrictions(countries: string[] | string | null): void {
    if (!this.autocomplete) return;
  
    try {
      if (countries === null) {
        this.autocomplete.setComponentRestrictions({country: []})
      } else if (typeof countries === 'string') {
        this.autocomplete.setComponentRestrictions({ country: [countries] });
      } else if (Array.isArray(countries)) {
        this.autocomplete.setComponentRestrictions({ country: countries });
      } else {
        throw new Error('Invalid format');
      }
    } catch (error) {
      console.warn('Failed to set restrictions:', countries, error);
    }
  }
  
  
  
  

  detectWhichItineraryItBelongsto(event: Event){
    const selectedValue = (event.target as HTMLSelectElement).value;
    console.log("start_Date event value ", selectedValue)
    const itinerary_id_to_set = this.itineraryService.getItineraryIdByDate(selectedValue);

    this.activityForm.get("itinerary_id")?.setValue(itinerary_id_to_set);
    console.log("this activity now belongs to ", this.activityForm.get("itinerary_id")?.value);

  }

  generateLocationUUID(): string {
    const newUUID = uuidv4().replaceAll("-", "").substring(0, 24);
    const localid = "local" + newUUID;
    console.log(newUUID + " created for location capture");
    return localid;
  }

  getIconForType(type: string): string | undefined {
    return this.activityService.getIconByName(type);
  }

  navigateBackToTripDetails(){

    this.router.navigate(["/trip-details", this.selected_trip_id]);
  }

  async onSubmit(){
    this.activityForm.get("location_lat")?.setValue(this.google_place_results.location_lat ?? 'N/A');
    this.activityForm.get("location_lng")?.setValue(this.google_place_results.location_lng ?? 'N/A');
    this.activityForm.get("location_address")?.setValue(this.google_place_results.location_address ?? 'N/A')
    this.activityForm.get("location_name")?.setValue(this.google_place_results.location_name ?? "N/A");
    this.activityForm.get("google_place_id")?.setValue(this.google_place_results.google_place_id ?? 'N/A');
    this.activityForm.get("g_biz_number")?.setValue(this.google_place_results.g_biz_number ?? 'N/A');
    this.activityForm.get("g_biz_website")?.setValue(this.google_place_results.g_biz_website ?? 'N/A');
    this.activityForm.get("g_opening_hrs")?.setValue(this.google_place_results.g_opening_hrs ?? ['N/A']);

    console.log("CURRENT FORM WHEN SUBMITTED ", this.activityForm.value)

    try {
      this.isUploading = true;
      
      const response = await this.activityService.putNewActivity(this.activityForm.value,`${this.currUser?.uid}`);
    
      if (response) {
        this.messagingService.add({
          severity: 'success',
          summary: 'Activity Created',
          detail: 'Your activity has been successfully saved!',
          life: 3000,
        });
    
        // Wait for the toast to be visible before navigating (adjust timing if needed)
        await new Promise(resolve => setTimeout(resolve, 3000));
    
        this.router.navigate(["/trip-details", this.selected_trip_id]);
      }
    
    } catch (error) {
      console.error('Error during activity submission:', error);
      this.messagingService.add({
        severity: 'error',
        summary: 'Submission Failed',
        detail: 'There was an error submitting your activity. Please try again.',
        life: 3000,
      });
    } finally {
      this.isUploading = false; // Ensure uploading state is reset
    }

  }

  getIconByActivityType(activity_type: string){

    return this.activityService.getIconByName(activity_type);

  }

  ngOnDestroy(): void {
    this.authStateSubscription.unsubscribe();
    this.loggedInUserDetailsSub.unsubscribe();
    this.selectedTripDetailsSub.unsubscribe();
    this.paramsSub.unsubscribe();
    if (this.activityTypeSub) {
      this.activityTypeSub.unsubscribe();
    }


  }




}


