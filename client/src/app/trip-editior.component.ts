import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FireBaseAuthStore } from './FireBaseAuth.store';
import { User } from 'firebase/auth';
import { BehaviorSubject, filter, firstValueFrom, map, Observable, Subscription } from 'rxjs';
import { AuthState, CountryCurrTime, FileUploadedInfo, TripInfo } from './models/models';
import { GoogleApiCallService } from './GoogleApiCallService';
import { ActivatedRoute, Router } from '@angular/router';
import { CountryDataForAppStore } from './CountryDataForApp.store';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ImageFetcherService } from './ImageFetcherService';
import { FileUploadService } from './FileUploadService';
import { MessageService } from 'primeng/api';
import { TripService } from './TripService';

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
  printDestinationInfo$ = new BehaviorSubject<string>("")

  //redirect to itineary builder once successful/redirect to unauthorized if authentication expires
  router = inject(Router)
  activatedRoute = inject(ActivatedRoute)
  private subToPathVariable!: Subscription


  //for form and form submission
  private fb = inject(FormBuilder);
  newTripForm!: FormGroup;
 


  //for uploading image
  dataUri!: string
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
              d_timezone_name: this.fb.control<string>(''),
              description_t: this.fb.control<string>(''),
              cover_image_id: this.fb.control<string>(''),
              attendees: this.fb.control<string>(''),
              master_user_id: this.fb.control<string>('')
            }
          )
    this.subToPathVariable = this.activatedRoute.params.subscribe(
      params => {

       
        this.newTripForm.get('trip_id')?.setValue(params["trip_id"])
        console.log("trip id set to " + this.newTripForm.get('trip_id')?.value)
        this.fileUploadForm = this.fb.group(
          {comments: this.fb.control<string>('cimage'),
            trip_id: this.fb.control<string>(params["trip_id"]),
            accommodation_id: this.fb.control<string>(''),
            activity_id: this.fb.control<string>(''),
            flight_id: this.fb.control<string>(''),
            user_id_pp: this.fb.control<string>(''),
            original_file_name: this.fb.control<string>('unknownfilename')
          }
        )


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

    const originInputElement = document.getElementById('destinationCity') as HTMLInputElement;
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


  onFileSelected(event: Event){
    //capture binary format of the file, store in browser's temporary storage directory 
    // to get a url to that resource in your directory
    //once stored than go ahead and encode it

    const input = event?.target as HTMLInputElement;
    if(input.files && input.files.length>0){
      const file =  input.files[0]
      const reader = new FileReader();
      reader.onload = () => {
        this.dataUri = reader.result as string;
      }
      
      reader.readAsDataURL(file);
      console.log(this.dataUri)
      // get file original name from input type=file field
      // Reset everything related to the previous image
    this.uploadSuccess = false;
    this.fileThatGotSuccessfullyUploaded = {
      resource_id: '',
      do_url: '',
      uploadedOn: '',
      fileOriginalName: '',
      resourceType: '',
    };
      this.fileNameHolder = file.name;
      this.newTripForm.patchValue({ cover_image_id: '' }); // Reset cover image in the form
      this.fileUploadForm.get('original_file_name')?.setValue(this.fileNameHolder);
    
  
    
    }

  }

  async uploadImage() {
    if (!this.dataUri) {
      console.error("No image selected for upload.");
      return;
    }

    this.isUploading = true;

    try {
      // Convert DataURI to Blob
      this.blob = this.dataURItoBlob(this.dataUri);
      const formValue = this.fileUploadForm.value;

      // **Upload the file**
      const result = await this.fileUploadService.upload(formValue, this.blob, this.currUser?.uid ?? '');

      if (result && result.resource_id) {
        this.fileThatGotSuccessfullyUploaded = result;
        const coverImageId = result.resource_id
        this.uploadSuccess = true;
       
        // ✅ **Update Form with Cover Image ID**
        this.newTripForm.patchValue({ cover_image_id: coverImageId});

        console.log("Upload Successful. Cover Image ID:", coverImageId);

        this.messagingService.add({
          severity: 'success',
          summary: 'Upload Successful',
          detail: 'Image uploaded successfully!',
          life: 3000,
        });
      } else {
        console.error("Upload failed. No resource ID returned.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      this.messagingService.add({
        severity: 'error',
        summary: 'Upload Failed',
        detail: 'There was an error uploading the image.',
        life: 3000,
      });
    } finally {
      this.isUploading = false;
    }
  }

  


  dataURItoBlob(dataURI: string): Blob{
    const [meta, base64Data] = dataURI.split(',');
    const mimeMatch = meta.match(/:(.*?);/);

    const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const byteString = atob(base64Data);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for(let i = 0; i < byteString.length; i++){
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], {type: mimeType});
  }


  cancelImage(): void {
    this.dataUri = '';  // Clear the image preview
    this.newTripForm.get('cover_image_id')?.reset();  // Reset the cover_image form control
    this.uploadSuccess = false;
    this.fileThatGotSuccessfullyUploaded = {
      resource_id: '',
      do_url: '',
      uploadedOn: '',
      fileOriginalName: '',
      resourceType: '',
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.newTripForm.valid) {
      console.error('Form is not valid!');
      return;
    }

    if (!this.uploadSuccess) {
      this.messagingService.add({
        severity: 'warn',
        summary: 'Upload Image First',
        detail: 'Please upload an image before submitting the form.',
        life: 3000,
      });
      return;
    }

    console.log("Final Form Data Before Submission:", this.newTripForm.value);

    const tripInfoToSend: TripInfo = {
      ...this.newTripForm.value,
      cover_image_id: this.fileThatGotSuccessfullyUploaded.resource_id,
      attendees: `${this.currUser?.uid}`,
      master_user_id: `${this.currUser?.uid}`,
      last_updated: ''
    };
    tripInfoToSend.cover_image_id = this.fileThatGotSuccessfullyUploaded.resource_id
    console.log(">>>>> final tripinfo before go service :", tripInfoToSend);
    try {
      const response = await this.tripService.putNewTrip(tripInfoToSend, `${this.currUser?.uid}`);
      console.log('Trip Submitted Successfully:', response);

      this.messagingService.add({
        severity: 'success',
        summary: 'Trip Created',
        detail: 'Your trip has been successfully created!',
        life: 3000,
      });

    } catch (error) {
      console.error('Error during trip submission:', error);
      this.messagingService.add({
        severity: 'error',
        summary: 'Submission Failed',
        detail: 'There was an error submitting your trip. Please try again.',
        life: 3000,
      });
    }
  }

  
  
  
  

  ngOnDestroy(): void {
    this.accessCurrUserDetailsSub.unsubscribe()
    this.authStateSubscription.unsubscribe()
    this.subToPathVariable.unsubscribe()
  }


}
