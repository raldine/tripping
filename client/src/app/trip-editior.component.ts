import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FireBaseAuthStore } from './FireBaseAuth.store';
import { User } from 'firebase/auth';
import { BehaviorSubject, filter, firstValueFrom, map, Observable, Subscription } from 'rxjs';
import { AuthState, CountryCurrTime, FileUploadedInfo, TripInfo, UserFront } from './models/models';
import { GoogleApiCallService } from './GoogleApiCallService';
import { ActivatedRoute, Router } from '@angular/router';
import { CountryDataForAppStore } from './CountryDataForApp.store';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ImageFetcherService } from './ImageFetcherService';
import { FileUploadService } from './FileUploadService';
import { MessageService } from 'primeng/api';
import { TripService } from './TripService';
import { UserDetailsStore } from './UserDetails.store';
import { Title } from '@angular/platform-browser';

declare global {
  interface Window {
    initAutocomplete: () => void;  // Add the initAutocomplete function to the window object
    google: any
  }
}

declare var google: any;

@Component({
  selector: 'app-trip-editior',
  standalone: false,
  templateUrl: './trip-editior.component.html',
  styleUrl: './trip-editior.component.css'
})
export class TripEditiorComponent implements OnInit, OnDestroy {

  titleService = inject(Title);



  //to load google autocomplete
  autocomplete: any;
  private googleServiceApi = inject(GoogleApiCallService);
  api_key: string | null = null;  // Initial value is null

  //user authen tracking
  private firebaseAuthStore = inject(FireBaseAuthStore)
  protected authStateCaptured$!: Observable<AuthState>
  protected currUser!: User | null
  private authStateSubscription!: Subscription //so that component can keep listening if user still authenticated at any point
  user_pp_url!: string | null; //to edit google profile pic link
  //in component lifecycle
  //To track currUser changes
  private accessCurrUserDetailsSub!: Subscription

  //to get Country data to return appropriate currency and timezone
  countriesData$!: Observable<CountryCurrTime[]>
  countryDataStore = inject(CountryDataForAppStore);
  printDestinationInfo$ = new BehaviorSubject<string>("")

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

  //redirect to itineary builder once successful/redirect to unauthorized if authentication expires
  router = inject(Router)
  activatedRoute = inject(ActivatedRoute)
  private subToPathVariable!: Subscription


  //for form and form submission
  private fb = inject(FormBuilder);
  newTripForm!: FormGroup;



  //for uploading image
  dataUri: string = ''
  blob!: Blob
  fileNameHolder!: string;
  fileUploadForm!: FormGroup;
  fileUploadService = inject(FileUploadService)
  //for loading incase too long
  isUploading = false;  // Flag to control the spinner visibility
  fileThatGotSuccessfullyUploaded: FileUploadedInfo = {
    resource_id: '',
    do_url: '',
    uploadedOn: '',
    fileOriginalName: '',
    resourceType: '',
  }
  uploadSuccess: boolean = false;

  //error uploading toast
  messagingService = inject(MessageService);

  //init tirpservice to post trip
  tripService = inject(TripService);

  async ngOnInit(): Promise<void> {


    this.titleService.setTitle('Adding Trip | Tripping');

    //initialise form
    this.newTripForm = this.fb.group(
      {
        trip_id: this.fb.control<string>(''),
        trip_name: this.fb.control<string>(''),
        start_date: this.fb.control<string>(''),
        end_date: this.fb.control<string>(''),
        destination_city: this.fb.control<string>(''),
        destination_curr: this.fb.control<string>(''),
        destination_timezone: this.fb.control<string>(''),
        dest_lat: this.fb.control<string>(''),
        dest_lng: this.fb.control<string>(''),
        d_timezone_name: this.fb.control<string>(''),
        d_iso2: this.fb.control<string>(''),
        description_t: this.fb.control<string | null>(null),
        cover_image_id: this.fb.control<string>('N/A'),
        attendees: this.fb.control<string>(''),
        master_user_id: this.fb.control<string>(''),
        //extra for cover image upload
        comments: this.fb.control<string>('cimage'),
        accommodation_id: this.fb.control<string>('N/A'),
        activity_id: this.fb.control<string>('N/A'),
        flight_id: this.fb.control<string>('N/A'),
        user_id_pp: this.fb.control<string>('N/A'),
        original_file_name: this.fb.control<string>('unknownfilename')

      }
    )
    this.subToPathVariable = this.activatedRoute.params.subscribe(
      params => {


        this.newTripForm.get('trip_id')?.setValue(params["trip_id"])
        console.log("trip id set to " + this.newTripForm.get('trip_id')?.value)




      }
    )




    this.authStateCaptured$ = this.firebaseAuthStore.getAuthState$
    this.authStateSubscription = this.authStateCaptured$.subscribe((authState) => {
      if (!authState.isAuthenticated) {
        this.router.navigate(['/unauthorized']); // Navigate to unauthorized page
        return; // Exit early if the user is not authenticated
      }
    })



    this.countriesData$ = this.countryDataStore.getCountriesData;

    if (!window['initAutocomplete']) {
      window['initAutocomplete'] = this.initAutocomplete.bind(this);
    }
    //get user details
    this.accessCurrUserDetailsSub = this.firebaseAuthStore.getAuthState$.pipe(
      map((authState) => authState.user),
      filter((user): user is User => user !== null)
    ).subscribe((user) => {
      this.currUser = user;  // Store the user object in the component


      this.user_pp_url = user.photoURL?.toString().replace("=s96-c", "") ?? null;
      //also assign user to newTripform as master user and attendee
      this.newTripForm.get("master_user_id")?.setValue(this.currUser.uid);
      this.newTripForm.get("attendees")?.setValue(this.currUser.uid);
      console.log('Current user:', this.currUser);
      console.log("current form before user entered details >>>>. ", this.newTripForm.value)
    });

    //sub currentUserDetails
    this.loggedInUserDetailsSub = this.userDetailsStore.userDetails$.subscribe((user) => {
      this.currUserDetails = { ...this.DEFAULT_USER, ...user };
      console.log("User details loaded:", this.currUserDetails);
    });



    //get google api key before form loads
    try {
      console.info("Fetching Google API key...");
      this.api_key = await firstValueFrom(this.googleServiceApi.getGoogleMapApi());

      if (this.api_key) {
        console.info("Google API key received:", this.api_key);

        // ✅ Reload Google Maps script only if missing
        if (!window.google || !window.google.maps) {
          console.info("Google Maps script not found, loading...");
          await this.loadGoogleMapsScript(this.api_key);
        } else {
          console.info("Google Maps script already loaded.");
        }

        // ✅ Always reinitialize Autocomplete to avoid stale references
        setTimeout(() => this.initAutocomplete(), 500);
      }
    } catch (err) {
      console.error("Error getting API key:", err);
    }


  }

  //end of ngOnInit



  minEndDate() {
    return this.newTripForm.get('start_date')?.value || '';
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

      script.onload = () => {
        resolve('Google Maps script loaded');
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

    const originInputElement = document.getElementById('destinationCity') as HTMLInputElement;
    if (originInputElement && google) {
      this.autocomplete = new google.maps.places.Autocomplete(originInputElement, {
        types: ['(cities)'],
      });
      console.info("Initializing Google Autocomplete...");

      // ✅ Destroy the previous instance before reinitializing
      if (this.autocomplete) {
        google.maps.event.clearInstanceListeners(this.autocomplete);
        this.autocomplete = null;
      }

      // ✅ Initialize a new Autocomplete instance
      this.autocomplete = new google.maps.places.Autocomplete(originInputElement, {
        types: ['(cities)'],
      });

      this.autocomplete?.addListener('place_changed', async () => {
        const place = this.autocomplete?.getPlace();
        if (place && place.name && place.address_components) {
          console.log('Selected Place: ', place.name);
          console.log("WHOLE PLACE OBJECT", place)


          const city = this.getAddressComponent(place.address_components, 'locality') ||
            this.getAddressComponent(place.address_components, 'colloquial_area');

          // const state = this.getAddressComponent(place.address_components, 'administrative_area_level_1');
          const country = this.getAddressComponent(place.address_components, 'country');
          const timezoneRaw: number = place.utc_offset_minutes ?? 0;  // in minutes
          console.log("timezone minutes is " + place.utc_offset_minutes)

          const safeCountry = country ?? "Singapore";  // Provide a default value to not break app
          this.countriesData$ = this.countryDataStore.filterCountryInfoByNames([safeCountry]);


          if (place.place_id) {
            //geometry for printing on google maps
            console.log('Fetching latitude & longitude for:', place.place_id);
            const geometry = await this.googleServiceApi.getPlaceGeometry(place.place_id);
            if (geometry) {
              console.log("Latitude:", geometry.lat);
              this.newTripForm.get("dest_lat")?.setValue(geometry.lat)

              console.log("Longitude:", geometry.lng);
              this.newTripForm.get("dest_lng")?.setValue(geometry.lng)



            } else {
              console.log("this result has no location lat lng")
              this.newTripForm.get("dest_lat")?.setValue('')
              this.newTripForm.get("dest_lng")?.setValue('')

            }
          }


          // Convert the timezone offset in minutes to hours and fractional part
          const hours: number = Math.floor(timezoneRaw / 60);
          const minutes: number = timezoneRaw % 60;

          // Create the timezone offset as UTC+hours.minutes (i.e., UTC+05.45)
          // Format the hours and minutes
          const formattedMinutes: string = minutes < 10 ? `0${minutes}` : `${minutes}`;

          // Create the timezone offset as UTC±hh:mm
          const timezone: string = `UTC${hours < 0 ? "-" : "+"}${Math.abs(hours).toString().padStart(2, '0')}:${formattedMinutes}`;

          //get currency and timezone name
          try {
            const countries = await firstValueFrom(this.countryDataStore.filterCountryInfoByNames([safeCountry]));

            const matchedCountry = countries.find(c => c.country_name === country);
            console.log("match country details ", matchedCountry)
            if (!matchedCountry) {
              console.warn("Country not found in store:", country);

              // If country is not found, set default values for form controls
              this.newTripForm.get('destination_city')?.setValue(city + "-" + country);
              this.newTripForm.get('destination_timezone')?.setValue('');  // or some default value
              this.newTripForm.get('destination_curr')?.setValue('');  // or some default value
              this.newTripForm.get('d_timezone_name')?.setValue('');
              this.printDestinationInfo$.next('')

              return;
            } // Find matching timezone based on UTC offset
            const matchingTimezone = matchedCountry.timezones.find(tz => tz.gmtOffsetName === timezone);
            const timezoneName = matchingTimezone ? matchingTimezone.tzName : "Unknown Timezone";

            // ✅ Update form fields
            this.newTripForm.get('destination_city')?.setValue(city + "-" + country);
            this.newTripForm.get('destination_timezone')?.setValue(timezone ?? '');
            this.newTripForm.get('destination_curr')?.setValue(matchedCountry.currency ?? '');
            this.newTripForm.get('d_timezone_name')?.setValue(timezoneName ?? '');
            this.newTripForm.get('d_iso2')?.setValue(matchedCountry.iso2 ?? '');
            this.printDestinationInfo$.next(`Destination Timezone: ${timezone} (${timezoneName}), Currency: ${matchedCountry.currency}`)


            console.log("Country Matched:", matchedCountry);
            console.log("Final Timezone Name:", timezoneName);
          } catch (error) {
            console.error("Error fetching country data:", error);
          }



        }
      });
    }
  }



  getAddressComponent(components: any[], type: string): string | null {
    const component = components.find(comp => comp.types.includes(type));
    return component ? component.long_name : null;
  }


  onFileSelected(event: Event) {
    //capture binary format of the file, store in browser's temporary storage directory 
    // to get a url to that resource in your directory
    //once stored than go ahead and encode it

    const input = event?.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0]
      this.isUploading = true;
      const reader = new FileReader();
      reader.onload = () => {
        this.dataUri = reader.result as string;
      }
      this.isUploading = false;

      reader.readAsDataURL(file);
      console.log(this.dataUri)

      this.fileNameHolder = file.name;
      this.newTripForm.get('original_file_name')?.setValue(this.fileNameHolder);



    }

  }





  dataURItoBlob(dataURI: string): Blob {
    const [meta, base64Data] = dataURI.split(',');
    const mimeMatch = meta.match(/:(.*?);/);

    const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const byteString = atob(base64Data);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], { type: mimeType });
  }


  cancelImage(): void {
    this.dataUri = '';  // Clear the image preview
    this.fileNameHolder = '';
    this.newTripForm.get("original_file_name")?.setValue('');

  }

  async onSubmit(): Promise<void> {
    if (!this.newTripForm.valid) {
      console.error('Form is not valid!');
      return;
    }


    if (this.dataUri.length != 0) {
      this.blob = this.dataURItoBlob(this.dataUri);
    }

    const formValue = this.newTripForm.value;
    console.log("Final Form Data Before Submission:", this.newTripForm.value);


    try {
      this.isUploading = true;

      const response = await this.tripService.putNewTrip(formValue, this.blob, `${this.currUser?.uid}`, this.currUserDetails.user_name, this.currUserDetails.user_email);

      if (response) {
        this.messagingService.add({
          severity: 'success',
          summary: 'Trip Created',
          detail: 'Your trip has been successfully created!',
          life: 3000,
        });

        // Wait for the toast to be visible before navigating (adjust timing if needed)
        await new Promise(resolve => setTimeout(resolve, 3000));

        this.router.navigate(["/dashboard"]);
      }

    } catch (error) {
      console.error('Error during trip submission:', error);
      this.messagingService.add({
        severity: 'error',
        summary: 'Submission Failed',
        detail: 'There was an error submitting your trip. Please try again.',
        life: 3000,
      });
    } finally {
      this.isUploading = false; // Ensure uploading state is reset
    }



  }




  ngOnDestroy(): void {
    this.accessCurrUserDetailsSub.unsubscribe()
    this.authStateSubscription.unsubscribe()
    this.subToPathVariable.unsubscribe()
  }


}
