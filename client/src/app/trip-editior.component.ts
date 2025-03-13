import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FireBaseAuthStore } from './FireBaseAuth.store';
import { User } from 'firebase/auth';
import { BehaviorSubject, filter, firstValueFrom, map, Observable, Subscription } from 'rxjs';
import { AuthState, CountryCurrTime } from './models/models';
import { GoogleApiCallService } from './GoogleApiCallService';
import { Router } from '@angular/router';
import { CountryDataForAppStore } from './CountryDataForApp.store';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ImageFetcherService } from './ImageFetcherService';

declare global {
  interface Window {
    initAutocomplete: () => void;  // Add the initAutocomplete function to the window object
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
  printTimeZoneName$ = new BehaviorSubject<string>("")

  //redirect to itineary builder once successful/redirect to unauthorized if authentication expires
  router = inject(Router)


  //for form and form submission
    private fb = inject(FormBuilder);
    newTripForm!: FormGroup;
    // userService = inject(UserService);


    //for auto load trip cover image
    imageFetcherService = inject(ImageFetcherService)

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
//get user details
    this.accessCurrUserDetailsSub = this.firebaseAuthStore.getAuthState$.pipe(
      map((authState) => authState.user),
      filter((user): user is User => user !== null)
    ).subscribe((user) => {
      this.currUser = user;  // Store the user object in the component
 
   
      this.user_pp_url = user.photoURL?.toString().replace("=s96-c", "") ?? null;
      console.log('Current user:', this.currUser);
    });






    //get google api key before form loads
    try {
      this.api_key = await firstValueFrom(this.googleServiceApi.getGoogleMapApi());
      if (this.api_key) {
        this.loadGoogleMapsScript(this.api_key);
      }
    } catch (err) {
      console.error('Error getting API key', err);
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
      if (this.autocomplete) {
        return; // Don't initialize again if already initialized
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
                  return;
              } // ✅ Find matching timezone based on UTC offset
              const matchingTimezone = matchedCountry.timezones.find(tz => tz.gmtOffsetName === timezone);
              const timezoneName = matchingTimezone ? matchingTimezone.tzName : "Unknown Timezone";
  
              // ✅ Update form fields
              // this.registerForm.get('country_origin')?.setValue(country);
              // this.registerForm.get('timezone_origin')?.setValue(timezone);
              // this.registerForm.get('currency_origin')?.setValue(matchedCountry.currency);
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
  
    ngOnDestroy(): void {
      this.accessCurrUserDetailsSub.unsubscribe()
      this.authStateSubscription.unsubscribe()
    }


}
