import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'firebase/auth';
import { Observable, Subscription } from 'rxjs';
import { FireBaseAuthStore } from './FireBaseAuth.store';
import { AccommodationObj, ActivityObj, AuthState, ItineraryObj, LocationObj, TripInfo, UserFront, UserRoles } from './models/models';
import { UserDetailsStore } from './UserDetails.store';
import { TripStore } from './TripsStore.store';
import { FileUploadService } from './FileUploadService';
import { UserService } from './UserService';
import { ItineraryService } from './ItineraryService';
import { DateFormatDayPipe } from './date-format-day.pipe';
import { DateFormatPipe } from './date-format.pipe';
import { v4 as uuidv4 } from 'uuid';
import { AccommodationService } from './AccommodationService';
import { LocationService } from './LocationService';
import { ActivityService } from './ActivityService';
import { TripService } from './TripService';
import { UserROLESService } from './UserROLESService';
import { SharingRedirectService } from './SharingRedirectService';
import { getGoogleMapsSearchUrl } from './models/models';

interface EventItem {
  status?: string;
  date?: string;
  icon?: string;
  color?: string;
  image?: string;
}

@Component({
  selector: 'app-trip-detail',
  standalone: false,
  templateUrl: './trip-detail.component.html',
  styleUrl: './trip-detail.component.scss'
})
export class TripDetailComponent implements OnInit, OnDestroy {

    //always get from backend
  //CHECK USR ROLE AND SET MODE TO VIEW ONLY OR EDITABLE
  curr_user_role_in_trip!: string
  view_mode!: string


  activatedRoute = inject(ActivatedRoute)
  paramsSub!: Subscription;
  selectedTripDetailsSub!: Subscription;

  tripStore = inject(TripStore)

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


  ///track current selected trip details
  selected_trip_id!: string
  selected_tripInfo!: TripInfo | null
  selected_trip_cover_img!: string | null
  selected_trip_master_name!: string | null
  userService = inject(UserService);
  tripService = inject(TripService);

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

  //for retrieveing ITINERARY
  itineraryService = inject(ItineraryService);
  itinerary_array!: ItineraryObj[] 
  dataFormatDayPipe = inject(DateFormatDayPipe)
  dataFormatPipe = inject(DateFormatPipe)

  //for retrieving Accommodations
  accommodationSvc = inject(AccommodationService);
  accomms_array: AccommodationObj[] = [];
  accomms_0_location!: string | null

  //load locations
  locationSvc = inject(LocationService);
  locationsForThisTrip: LocationObj[] = [];

  //for retrieving activites
  activityService = inject(ActivityService);
  currentItinerarySelected!: string
  currentActivitiesForSelectedItn!: ActivityObj[] | null;

  //track user attendees and user roles!
  curr_trip_user_roles!: UserRoles[]
  userRolesService = inject(UserROLESService);

    // Cache for activity locations 
    locationForActivities: { [key: string]: LocationObj | null } = {};
      getGoogleMapsSearchUrl = getGoogleMapsSearchUrl



  //each activity
  events: EventItem[] = [
    { status: 'Ordered', date: '15/10/2020 10:30', icon: 'pi pi-shopping-cart', color: '#9C27B0', image: 'game-controller.jpg' },
    { status: 'Processing', date: '15/10/2020 14:00', icon: 'pi pi-cog', color: '#673AB7' },
    { status: 'Shipped', date: '15/10/2020 16:15', icon: 'pi pi-shopping-cart', color: '#FF9800' },
    { status: 'Delivered', date: '16/10/2020 10:00', icon: 'pi pi-check', color: '#607D8B' }
];

  scrollableTabs = [
    { value: 0, title: 'Tab 1', content: 'This is the content for Tab 1' , itinerary_id: 'aaa'},
    { value: 1, title: 'Tab 2', content: 'This is the content for Tab 2' , itinerary_id: 'aaa'},
    { value: 2, title: 'Tab 3', content: 'This is the content for Tab 3' , itinerary_id: 'aaa'},
    { value: 3, title: 'Tab 4', content: 'This is the content for Tab 4' , itinerary_id: 'aaa'},
    { value: 4, title: 'Tab 5', content: 'This is the content for Tab 5' , itinerary_id: 'aaa'}
  ];
  tabValue = 0;


  //get resources
  fileUploadService = inject(FileUploadService)

  //generate accommodation link if dh
  acc_id_generated!: string;

  //generate activity link if dh
  activity_id_generated!: string;

  //sharing joureny
  sharingRedirectService = inject(SharingRedirectService);

  //this user's role for this trip (master/editor/viewer)



  async ngOnInit(): Promise<void> {
    this.paramsSub = this.activatedRoute.params.subscribe(params => {
      this.selected_trip_id = params["trip_id"];

    })
    //for when users come in as editor or viewer(NEW)
    this.sharingRedirectService.setCapturedTripIdForRedirect(null);
    this.sharingRedirectService.setCheckIfUserIsSigningUpAsEditorOrViewer(null);
    this.sharingRedirectService.setIfNewUserWhenLandOnShared(null);
    this.sharingRedirectService.setInviter(null);
    this.sharingRedirectService.setShare_id(null);
    this.sharingRedirectService.setShare_id_view_only(null);
    this.sharingRedirectService.setTrip_name(null);


    this.authStateCaptured$ = this.firebaseAuthStore.getAuthState$
    this.authStateSubscription = this.authStateCaptured$.subscribe((authState) => {
      if (!authState.isAuthenticated) {
        this.router.navigate(['/unauthorized']); // Navigate to unauthorized page
        return; // Exit early if the user is not authenticated
      } else {
        if (authState.user && authState.user.uid) {
          this.userDetailsStore.loadUserDetails(authState.user.uid)
          console.log("user details loaded in component store");
          // this.tripStore.loadTrips(authState.user.uid);
          // console.log("users trips loaded in component store")
          this.currUser = authState.user

        }

      }
    })

    //sub currentUserDetails
    this.loggedInUserDetailsSub = await this.userDetailsStore.userDetails$.subscribe((user) => {
      this.currUserDetails = { ...this.DEFAULT_USER, ...user }
      console.log("User details loaded:", this.currUserDetails);
    });

    this.selectedTripDetailsSub = await this.tripStore.selected_tripInfo$.subscribe(async (trip) => {
      if (trip) {
          // If trip exists, use it
          this.selected_tripInfo = trip;
      } else {
          // If trip is null, fetch data from the backend
          console.log("No trip information found. Fetching from backend...");
          try {
              const fetchedTripInfo = await this.tripService.getTripInfoByTrip_id(this.selected_trip_id, this.currUser?.uid ?? ''); 
              //store in trip store
              this.tripStore.setSelectedTripInfo(fetchedTripInfo);
              this.selected_tripInfo = fetchedTripInfo;
          } catch (error) {
              console.error("Error fetching trip info from backend:", error);
          }
      }
  
      // Fetch the cover image if trip exists
      if (this.selected_tripInfo?.cover_image_id) {
          const cover_image = await this.fileUploadService.getFileByResourceId(this.selected_tripInfo.cover_image_id, this.currUser?.uid ?? '');
          this.selected_trip_cover_img = cover_image?.do_url ?? '';
      }
  });

    this.curr_trip_user_roles =  await this.userRolesService.getAllUsersRolesForTripFromBE(this.selected_trip_id, this.currUser?.uid ?? '');

    if(this.curr_trip_user_roles.length > 0){
      this.userRolesService.setallUsersRolesForTrip(this.curr_trip_user_roles);

    }

    const masterUser = await this.userService.getUserbyFirebaseId(this.selected_tripInfo?.master_user_id ?? null)
    this.selected_trip_master_name = masterUser?.user_name ?? '';

    this.itinerary_array = await this.itineraryService.getAllItnByTripId(this.selected_trip_id, this.currUser?.uid ?? '');

    if(this.itinerary_array  && this.itinerary_array?.length > 0 ){
      this.scrollableTabs = this.itinerary_array.map((itinerary, index) => ({
        value: index,
        title: `${this.dataFormatPipe.transform(itinerary.itn_date)}`,
        content: `Day ${index+1} : ${this.dataFormatDayPipe.transform(itinerary.itn_date)}`,
        itinerary_id: itinerary.itinerary_id ?? ''
      }));

      this.tabValue = 0;
      this.currentItinerarySelected = this.scrollableTabs[0].itinerary_id ?? '';
    }

    this.accomms_array = await this.accommodationSvc.getAllAccommsFromTripId(this.selected_trip_id, this.currUser?.uid ?? '')


    this.acc_id_generated = this.generateAccUUID();
    this.activity_id_generated = this.generateActivityUUID();


    //get all locations for this trip and store in location service and here
    this.locationsForThisTrip = await this.locationSvc.getAllLocationsFromTripId(this.selected_trip_id, this.currUser?.uid ?? '')
    if(this.locationsForThisTrip.length!==0){
      this.locationSvc.setAllLocationsForTrip(this.locationsForThisTrip) //for store and retrieval later
      console.log("locations for this trip retrieved and stored in service")
    }

    this.activityService.setAllActivitiesForTrip(await this.activityService.getAllActivitiesFromTripId(this.selected_trip_id, this.currUser?.uid ?? ''))
    this.currentActivitiesForSelectedItn = this.activityService.getActivitiesFromCurrentAllActivitiesForItineraryDay(this.currentItinerarySelected)

    if(this.accomms_array.length>0){
      console.log("FIRST ACC LOCATION ID IS >>>> ", this.accomms_array[0].location_id)
      this.accomms_0_location = this.locationSvc.getOneLocationFromCurrentAllLocationsForTrip(this.accomms_array[0].location_id)?.location_address ?? 'null';
      console.log("address is ", this.accomms_0_location)

    }


    if (this.currentActivitiesForSelectedItn) {
      // Preload locations
      for (const act of this.currentActivitiesForSelectedItn) {
        const locat = await this.locationSvc.getLocationObjFromLocationId(act.location_id, this.currUser?.uid ?? '')
        this.locationForActivities[act.location_id] = locat ?? null
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
    console.log("view mode is", this.view_mode)
  }


  async selectTab(value: number): Promise<void> {
    if (value >= 0 && value < this.itinerary_array.length) {
        // Only access the itinerary if the value is within bounds
        const selectedItinerary = this.itinerary_array[value];

        // Check if the selected itinerary exists and has an itinerary_id
        if (selectedItinerary && selectedItinerary.itinerary_id) {
            this.currentItinerarySelected = selectedItinerary.itinerary_id;
            this.currentActivitiesForSelectedItn = this.activityService.getActivitiesFromCurrentAllActivitiesForItineraryDay(this.currentItinerarySelected)
            if(this.currentActivitiesForSelectedItn!==null)
            for (const act of this.currentActivitiesForSelectedItn) {
              const locat = await this.locationSvc.getLocationObjFromLocationId(act.location_id, this.currUser?.uid ?? '')
              this.locationForActivities[act.location_id] = locat ?? null
            }
        } else {
            this.currentItinerarySelected = '';  // Default value if no itinerary_id exists
        }

        this.tabValue = value;  // Update tabValue to the selected tab index
        console.log("Selected Itinerary ID:", this.currentItinerarySelected);  // Debug log
    } else {
        // Handle the case where the value is out of bounds
        console.warn(`Invalid tab index: ${value}. No corresponding itinerary found.`);
        this.currentItinerarySelected = '';  // Default value if the index is invalid
        this.currentActivitiesForSelectedItn = null;
    }
}

// Function to handle tab change
  async onTabChange(event: any): Promise<void> {

  console.log(event)
  console.log("when changing tab scroll event value is ", event)
  this.tabValue = event;
  console.log("current tabValue is ", this.tabValue)
  const selectedTab = this.scrollableTabs.find(tab => tab.value === event);
  if (selectedTab) {
    
      this.currentItinerarySelected = selectedTab.itinerary_id;
      console.log("Selected Itinerary ID on tab change:", this.currentItinerarySelected);  // Debug log
      this.currentActivitiesForSelectedItn = this.activityService.getActivitiesFromCurrentAllActivitiesForItineraryDay(this.currentItinerarySelected)
      if(this.currentActivitiesForSelectedItn!==null)
        for (const act of this.currentActivitiesForSelectedItn) {
          const locat = await this.locationSvc.getLocationObjFromLocationId(act.location_id, this.currUser?.uid ?? '')
          this.locationForActivities[act.location_id] = locat ?? null
        }
    }
}

  navigateToAccommodationNew(){

    this.itineraryService.setAllItineraryForTrip(this.itinerary_array);
    this.router.navigate(["/addeditaccomm", this.acc_id_generated]);
 
  }

  navigateToActivityNew(){

    this.itineraryService.setAllItineraryForTrip(this.itinerary_array);
    this.router.navigate(["/addeditact", this.activity_id_generated]);
 
  }

  navigateToAccommodationViewOnly(accomodationObj: AccommodationObj){

    this.accommodationSvc.setOneAccommObj(accomodationObj);
    this.locationSvc.setOneLocation(this.locationSvc.getOneLocationFromCurrentAllLocationsForTrip(accomodationObj.location_id))
    this.router.navigate(["/viewaccomm", accomodationObj.accommodation_id]);

  }

  navigateToActivityViewOnly(activityObj: ActivityObj){

    this.activityService.setOneActivity(activityObj);
    this.locationSvc.setOneLocation(this.locationSvc.getOneLocationFromCurrentAllLocationsForTrip(activityObj.location_id))
    this.router.navigate(["/viewactivity", activityObj.activity_id]);

  }

  navigateToTripDetailsViewOnly(){

    this.router.navigate(["/viewtripdeets", this.selected_trip_id]);

  }

  getIconByActivityType(activity_type: string){

    return this.activityService.getIconByName(activity_type);

  }

  generateAccUUID(): string {
    const newUUID = uuidv4().replaceAll("-", "").substring(0, 24);
    const accId = "acc" + newUUID;
    console.log(newUUID + " created for accommodation capture");
    return accId;
  }

  generateActivityUUID(): string {
    const newUUID = uuidv4().replaceAll("-", "").substring(0, 24);
    const act_id = "act" + newUUID;
    console.log(newUUID + " created for activity capture");
    return act_id;
  }

  ngOnDestroy(): void {
    this.authStateSubscription.unsubscribe();
    this.loggedInUserDetailsSub.unsubscribe();
    this.selectedTripDetailsSub.unsubscribe();
    this.paramsSub.unsubscribe();
    

  }

}
