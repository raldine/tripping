import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'firebase/auth';
import { Subscription, Observable } from 'rxjs';
import { DateFormatDayPipe } from './date-format-day.pipe';
import { DateFormatPipe } from './date-format.pipe';
import { FireBaseAuthStore } from './FireBaseAuth.store';
import { TripInfo, AuthState, UserFront, UserRoles } from './models/models';
import { TripStore } from './TripsStore.store';
import { UserDetailsStore } from './UserDetails.store';
import { UserService } from './UserService';
import { FileUploadService } from './FileUploadService';
import { TripService } from './TripService';
import { UserROLESService } from './UserROLESService';

@Component({
  selector: 'app-trip-view',
  standalone: false,
  templateUrl: './trip-view.component.html',
  styleUrl: './trip-view.component.scss'
})
export class TripViewComponent implements OnInit{

  //always get from backend
  //CHECK USR ROLE AND SET MODE TO VIEW ONLY OR EDITABLE
  curr_user_role_in_trip!: string
  view_mode!: string

 

  //get trip_details
  activatedRoute = inject(ActivatedRoute)
  paramsSub!: Subscription;

  //format dates
  dataFormatDayPipe = inject(DateFormatDayPipe)
  dataFormatPipe = inject(DateFormatPipe)


  //to retrieve destination currency, timezone etc
  tripStore = inject(TripStore)
  ///track current selected trip details
  selected_trip_id!: string
  selected_tripInfo!: TripInfo | null
  selectedTripDetailsSub!: Subscription;
  selected_trip_cover_img!: string | null
  selected_trip_master_name!: string | null

  //get cover img
    //get resources
    fileUploadService = inject(FileUploadService)


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



  tripService = inject(TripService);

  //get list of users attending this trip
 curr_Trip_user_roles!: UserRoles[] | null
 userRolesService = inject(UserROLESService);
 
 //prepare sharing
 share_url_edit!: string
 share_url_view_only!:string

 editorTooltipText = 'Copy to clipboard';
viewerTooltipText = 'Copy to clipboard';


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


  async ngOnInit(): Promise<void> {
    
    this.paramsSub = this.activatedRoute.params.subscribe(params => {
      this.selected_trip_id = params["trip_id"];

    })


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
              const fetchedTripInfo = await this.tripService.getTripInfoByTrip_id(this.selected_trip_id, this.currUserDetails.firebase_uid); 
              //store in trip store
              this.tripStore.setSelectedTripInfo(fetchedTripInfo);
              this.selected_tripInfo = fetchedTripInfo;
          } catch (error) {
              console.error("Error fetching trip info from backend:", error);
          }
      }
  
      // Fetch the cover image if trip exists
      if (this.selected_tripInfo?.cover_image_id) {
          const cover_image = await this.fileUploadService.getFileByResourceId(this.selected_tripInfo.cover_image_id, this.currUserDetails.firebase_uid);
          this.selected_trip_cover_img = cover_image?.do_url ?? '';
      }
  });

    const masterUser = await this.userService.getUserbyFirebaseId(this.selected_tripInfo?.master_user_id ?? null)
    this.selected_trip_master_name = masterUser?.user_name ?? '';

    
    this.curr_Trip_user_roles = this.userRolesService.getAllUSERROLEsfromStore();

    if(this.curr_Trip_user_roles === null){
      //get from backend if not
      this.curr_Trip_user_roles = await this.userRolesService.getAllUsersRolesForTripFromBE(this.selected_trip_id, this.currUserDetails.firebase_uid);

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

    if(this.view_mode === "Master"){
      const invitername = this.currUserDetails.user_name.replaceAll(" ", "_");
      this.share_url_edit = `http://localhost:4200/#/sharing/${this.selected_trip_id}/${await this.userRolesService.getThisTripShareUrl("edit", this.selected_trip_id, this.currUserDetails.firebase_uid)}?mode=edit&inviter=${invitername}`;
      this.share_url_view_only = `http://localhost:4200/#/sharing/${this.selected_trip_id}/${await this.userRolesService.getThisTripShareUrl("view", this.selected_trip_id, this.currUserDetails.firebase_uid)}?mode=view&inviter=${invitername}`;
    }



  }

  navigateBackToTripDetails(){



    this.router.navigate(["/trip-details", this.selected_trip_id]);
  }

  copyToClipboard(inputElement: HTMLInputElement, identifier: string) {
    inputElement.select();
    inputElement.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(inputElement.value);
  
    if (identifier === 'editor') {
      this.editorTooltipText = 'Copied!';
      setTimeout(() => {
        this.editorTooltipText = 'Copy to clipboard';
      }, 2000);
    }
  
    if (identifier === 'viewer') {
      this.viewerTooltipText = 'Copied!';
      setTimeout(() => {
        this.viewerTooltipText = 'Copy to clipboard';
      }, 2000);
    }
  }
  

  ngOnDestroy(): void {
    this.authStateSubscription.unsubscribe();
    this.loggedInUserDetailsSub.unsubscribe();
    this.selectedTripDetailsSub.unsubscribe();
    this.paramsSub.unsubscribe();

  }

}
