import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'firebase/auth';
import { Observable, Subscription } from 'rxjs';
import { FireBaseAuthStore } from './FireBaseAuth.store';
import { AuthState, ItineraryObj, TripInfo, UserFront } from './models/models';
import { UserDetailsStore } from './UserDetails.store';
import { TripStore } from './TripsStore.store';
import { FileUploadService } from './FileUploadService';
import { UserService } from './UserService';
import { ItineraryService } from './ItineraryService';
import { DateFormatDayPipe } from './date-format-day.pipe';
import { DateFormatPipe } from './date-format.pipe';
import { v4 as uuidv4 } from 'uuid';

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
  itinerary_array: ItineraryObj[] | null = [];
  dataFormatDayPipe = inject(DateFormatDayPipe)
  dataFormatPipe = inject(DateFormatPipe)


  //each activity
  events: EventItem[] = [
    { status: 'Ordered', date: '15/10/2020 10:30', icon: 'pi pi-shopping-cart', color: '#9C27B0', image: 'game-controller.jpg' },
    { status: 'Processing', date: '15/10/2020 14:00', icon: 'pi pi-cog', color: '#673AB7' },
    { status: 'Shipped', date: '15/10/2020 16:15', icon: 'pi pi-shopping-cart', color: '#FF9800' },
    { status: 'Delivered', date: '16/10/2020 10:00', icon: 'pi pi-check', color: '#607D8B' }
];

  scrollableTabs = [
    { value: 0, title: 'Tab 1', content: 'This is the content for Tab 1' },
    { value: 1, title: 'Tab 2', content: 'This is the content for Tab 2' },
    { value: 2, title: 'Tab 3', content: 'This is the content for Tab 3' },
    { value: 3, title: 'Tab 4', content: 'This is the content for Tab 4' },
    { value: 4, title: 'Tab 5', content: 'This is the content for Tab 5' }
  ];

  tabValue = 0;


  //get resources
  fileUploadService = inject(FileUploadService)

  //generate accommodation link if dh
  acc_id_generated!: string;


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
      this.selected_tripInfo = trip;

      const cover_image = await this.fileUploadService.getFileByResourceId(this.selected_tripInfo?.cover_image_id ?? null, this.currUserDetails.firebase_uid);
      this.selected_trip_cover_img = cover_image?.do_url ?? '';

    })

    const masterUser = await this.userService.getUserbyFirebaseId(this.selected_tripInfo?.master_user_id ?? null)
    this.selected_trip_master_name = masterUser?.user_name ?? '';

    this.itinerary_array = await this.itineraryService.getAllItnByTripId(this.selected_trip_id, this.currUser?.uid ?? '');

    if(this.itinerary_array  && this.itinerary_array?.length > 0 ){
      this.scrollableTabs = this.itinerary_array.map((itinerary, index) => ({
        value: index,
        title: `${this.dataFormatPipe.transform(itinerary.itn_date)}`,
        content: `Day ${index+1} : ${this.dataFormatDayPipe.transform(itinerary.itn_date)}`
      }));
    }


    this.acc_id_generated = this.generateAccUUID();



  }

  navigateToAccommodationNew(){

    this.itineraryService.setAllItineraryForTrip(this.itinerary_array);
    this.router.navigate(["/addeditaccomm", this.acc_id_generated]);

  }

  generateAccUUID(): string {
    const newUUID = uuidv4().replaceAll("-", "").substring(0, 24);
    const accId = "acc" + newUUID;
    console.log(newUUID + " created for accommodation capture");
    return accId;
  }

  ngOnDestroy(): void {
    this.authStateSubscription.unsubscribe();
    this.loggedInUserDetailsSub.unsubscribe();
    this.selectedTripDetailsSub.unsubscribe();
    this.paramsSub.unsubscribe();

  }

}
