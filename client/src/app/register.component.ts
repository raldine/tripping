import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, filter, firstValueFrom, map, Observable, Subscription, tap } from 'rxjs';
import { User } from 'firebase/auth';
import { GoogleApiCallService } from './GoogleApiCallService';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthState, CountryCurrTime, UserFront, UserRoles } from './models/models';
import { UserService } from './UserService';
import { Router } from '@angular/router';
import { FireBaseAuthStore } from './FireBaseAuth.store';
import { CountryDataForAppStore } from './CountryDataForApp.store';
import { SharingRedirectService } from './SharingRedirectService';
import { UserROLESService } from './UserROLESService';
import { MessageService } from 'primeng/api';
import { Title } from '@angular/platform-browser';


declare global {
  interface Window {
    initAutocomplete: () => void;  // Add the initAutocomplete function to the window object
  }
}

declare var google: any;

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit, OnDestroy {

  titleService = inject(Title);


  //to load google autocomplete
  autocomplete: any;
  private googleServiceApi = inject(GoogleApiCallService);

  //User Authentication info
  private firebaseAuthStore = inject(FireBaseAuthStore)
  protected authStateCaptured$!: Observable<AuthState>
  protected currUser!: User | null
  private authStateSubscription!: Subscription //so that component can keep listening if user still authenticated at any point
  //in component lifecycle
  //To track currUser changes
  private accessCurrUserDetailsSub!: Subscription

  api_key: string | null = null;  // Initial value is null
  user_pp_url!: string | null; //to edit google profile pic link

  //for form and form submission
  private fb = inject(FormBuilder);
  registerForm!: FormGroup;
  userService = inject(UserService);

  //to get Country data to return appropriate currency and timezone
  countriesData$!: Observable<CountryCurrTime[]>
  countryDataStore = inject(CountryDataForAppStore);
  printTimeZoneName$ = new BehaviorSubject<string>("")

  //redirect to dashboard once successful/redirect to unauthorized if authentication expires
  router = inject(Router)

  //for sharing link new user
  isUserNewAndCameFromSharingLink!: boolean | null
  sharingRedirectService = inject(SharingRedirectService);
  special_Route_For_Sharing_Link!: boolean
  trip_name!: string | null
  inviter!: string | null
  isUploading = false;  // Flag to control the spinner visibility
  userRolesService = inject(UserROLESService)
  messagingService = inject(MessageService);


  async ngOnInit(): Promise<void> {

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


      this.titleService.setTitle('Sign Up | Tripping');


    //intialise form
    this.registerForm = this.fb.group(
      {
        user_name: this.fb.control<string>(''),
        country_origin: this.fb.control<string>(''),
        timezone_origin: this.fb.control<string>(''),
        currency_origin: this.fb.control<string>(''),
        notif: this.fb.control<boolean>(true)
      }
    )


    //get user details
    this.accessCurrUserDetailsSub = this.firebaseAuthStore.getAuthState$.pipe(
      map((authState) => authState.user),
      filter((user): user is User => user !== null)
    ).subscribe((user) => {
      this.currUser = user;  // Store the user object in the component
      //autofill the registerform with displayname from google, email and firebase uid
      this.registerForm.get('user_name')?.setValue(user.displayName ?? '');
      this.user_pp_url = user.photoURL?.toString().replace("=s96-c", "") ?? null;
      console.log('Current user:', this.currUser);
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

    this.isUserNewAndCameFromSharingLink = this.sharingRedirectService.getIfNewUserWhenLandOnShared();

    if (this.isUserNewAndCameFromSharingLink !== null && this.isUserNewAndCameFromSharingLink === true) {
      this.special_Route_For_Sharing_Link = true;
      this.trip_name = this.sharingRedirectService.getTrip_name();
      this.inviter = this.sharingRedirectService.getInviter();
    } else {
      this.special_Route_For_Sharing_Link = false;
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

    const originInputElement = document.getElementById('originCityCountry') as HTMLInputElement;
    if (originInputElement && google) {
      this.autocomplete = new google.maps.places.Autocomplete(originInputElement, {
        types: ['(cities)'],
      });

      this.autocomplete?.addListener('place_changed', async () => {
        const place = this.autocomplete?.getPlace();
        if (place && place.name && place.address_components) {
          console.log('Selected Place: ', place.name);
          // console.log('Selected full object: ', place.address_components);

          const city = this.getAddressComponent(place.address_components, 'locality') ||
            this.getAddressComponent(place.address_components, 'colloquial_area');

          // const state = this.getAddressComponent(place.address_components, 'administrative_area_level_1');
          const country = this.getAddressComponent(place.address_components, 'country');
          const timezoneRaw: number = place.utc_offset_minutes ?? 0;  // in minutes
          console.log("timezone minutes is " + place.utc_offset_minutes)

          const safeCountry = country ?? "Singapore";  // Provide a default value to not break app
          this.countriesData$ = this.countryDataStore.filterCountryInfoByNames([safeCountry]);

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
            if (!matchedCountry) {
              console.warn("Country not found in store:", country);
              this.registerForm.get('country_origin')?.setValue(country);
              this.registerForm.get('timezone_origin')?.setValue(timezone);
              this.registerForm.get('currency_origin')?.setValue('');
              this.printTimeZoneName$.next('');
              return;
            } // ✅ Find matching timezone based on UTC offset
            const matchingTimezone = matchedCountry.timezones.find(tz => tz.gmtOffsetName === timezone);
            const timezoneName = matchingTimezone ? matchingTimezone.tzName : "Unknown Timezone";

            // ✅ Update form fields
            this.registerForm.get('country_origin')?.setValue(country);
            this.registerForm.get('timezone_origin')?.setValue(timezone);
            this.registerForm.get('currency_origin')?.setValue(matchedCountry.currency);
            this.printTimeZoneName$.next(timezoneName);

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


  processForm() {

    const newUser: UserFront = {
      user_id: null,
      user_name: this.registerForm.get('user_name')?.value,
      user_email: this.currUser?.email ?? '',
      firebase_uid: this.currUser?.uid ?? '',
      country_origin: this.registerForm.get('country_origin')?.value,
      timezone_origin: this.registerForm.get('timezone_origin')?.value,
      currency_origin: this.registerForm.get('currency_origin')?.value,
      notif: this.registerForm.get('notif')?.value


    }

    this.userService.registerUser(newUser)
      .then(async (response) => {

        if (response.match("OK")) {

          if (this.special_Route_For_Sharing_Link === true) {
            this.isUploading = true;
            if (this.sharingRedirectService.getIfUserIsSigningUpAsEditorOrViewer() === "Editor") {
              const newEditor: UserRoles = {
                trip_id: this.sharingRedirectService.getCapturedTripIdForRedirect() ?? '',
                user_id: this.currUser?.uid ?? '',
                user_display_name: this.registerForm.get('user_name')?.value,
                user_email: this.currUser?.email ?? '',
                role: "Editor",
                share_id: this.sharingRedirectService.getShare_id() ?? '',
                share_id_view_only: ""
              }
              const response = await this.userRolesService.registerNewEDITORUser(newEditor);
              if (response === "Registered as editor") {
                this.isUploading = false;
                this.messagingService.add({
                  severity: 'success',
                  summary: 'Registered as Editor for trip',
                  detail: 'Successfully registered as editor!',
                  life: 3000,
                });

                // Wait for the toast to be visible before navigating (adjust timing if needed)
                await new Promise(resolve => setTimeout(resolve, 3000));
                this.isUploading = false;
                this.router.navigate(["/trip-details", this.sharingRedirectService.getCapturedTripIdForRedirect()]);

              }


            } else if (this.sharingRedirectService.getIfUserIsSigningUpAsEditorOrViewer() === "Viewer") {
              const newViewer: UserRoles = {
                trip_id: this.sharingRedirectService.getCapturedTripIdForRedirect() ?? '',
                user_id: this.currUser?.uid ?? '',
                user_display_name: this.registerForm.get('user_name')?.value,
                user_email: this.currUser?.email ?? '',
                role: "Viewer",
                share_id: '',
                share_id_view_only: this.sharingRedirectService.getShare_id_view_only() ?? ''
              }
              const response = await this.userRolesService.registerNewVIEWERUser(newViewer);
              if (response === "Registered as viewer") {
              
                this.messagingService.add({
                  severity: 'success',
                  summary: 'Registered as Viewer for trip',
                  detail: 'Successfully registered as viewer!',
                  life: 3000,
                });

                // Wait for the toast to be visible before navigating (adjust timing if needed)
                await new Promise(resolve => setTimeout(resolve, 3000));
                this.isUploading = false;
                this.router.navigate(["/trip-details", this.sharingRedirectService.getCapturedTripIdForRedirect()]);
              }

            }

          } else {

            this.router.navigate(['/dashboard'])
          }


        }
      })



  }

  ngOnDestroy(): void {
    this.accessCurrUserDetailsSub.unsubscribe()
    this.authStateSubscription.unsubscribe()
  }

}



function resolve(apiKey: string): any {
  throw new Error('Function not implemented.');
}

