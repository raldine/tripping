import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharingRedirectService } from './SharingRedirectService';
import { Subscription } from 'rxjs';
import { TripService } from './TripService';
import { TripInfo, UserFront, UserRoles } from './models/models';
import { FileUploadService } from './FileUploadService';
import { Auth } from '@angular/fire/auth';
import { User, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { FireBaseAuthStore } from './FireBaseAuth.store';
import { AuthService } from './AuthService';
import { UserService } from './UserService';
import { UserROLESService } from './UserROLESService';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-share-editor-landing',
  standalone: false,
  templateUrl: './share-editor-landing.component.html',
  styleUrl: './share-editor-landing.component.scss'
})
export class ShareEditorLandingComponent implements OnInit {


  retrieved_partial_trip_info!: TripInfo | null
  trip_id!: string | null
  trip_name!: string | null
  trip_destination!: string | null
  trip_cover_image!: string | null
  share_id!: string | null
  mode!: string | null
  inviter!: string | null
  mode_to_print!: string | null

  tripService = inject(TripService);
  fileUploadService = inject(FileUploadService)

  activatedRoute = inject(ActivatedRoute)
  queryParamsSub!: Subscription

    messagingService = inject(MessageService);


  sharingRedirectService = inject(SharingRedirectService)

  auth = inject(Auth);
  // authService = inject(AuthService);
  firebaseAuthStore = inject(FireBaseAuthStore)
  router = inject(Router);
  user: User | null = null;  // To store the logged-in user

  userExistingDetails!: UserFront | null
  userService = inject(UserService);

  authService = inject(AuthService)

  userRolesService = inject(UserROLESService)

  isUploading = false;  // Flag to control the spinner visibility

  async ngOnInit(): Promise<void> {
    console.log('ShareEditorLandingComponent loaded');

    this.trip_id = this.activatedRoute.snapshot.paramMap.get('trip_id');
    this.sharingRedirectService.setCapturedTripIdForRedirect(this.trip_id);
    this.retrieved_partial_trip_info = await this.tripService.getTripInfoByTrip_id(this.trip_id ?? '', "sharingadmin");

    if (this.retrieved_partial_trip_info !== null) {
      this.trip_name = this.retrieved_partial_trip_info.trip_name;
      const imagurl = await this.fileUploadService.getFileByResourceId(this.retrieved_partial_trip_info.cover_image_id, "sharingadmin")
      this.trip_cover_image = imagurl?.do_url ?? ''

      this.trip_destination = this.retrieved_partial_trip_info.destination_city.replaceAll("-", ", ");
      this.sharingRedirectService.setTrip_name(this.trip_name);
    }


    this.share_id = this.activatedRoute.snapshot.paramMap.get('share_id');

    // Get query parameters
    this.queryParamsSub = this.activatedRoute.queryParams.subscribe(params => {
      this.mode = params['mode'];
      this.inviter = params['inviter'].replaceAll("_", " ");
      this.sharingRedirectService.setInviter(this.inviter);
    });

    if (this.mode === "edit") {
      this.sharingRedirectService.setCheckIfUserIsSigningUpAsEditorOrViewer("Editor");
      this.sharingRedirectService.setShare_id(this.share_id)
      this.mode_to_print = "an Editor"
    } else if (this.mode === "view") {
      this.sharingRedirectService.setCheckIfUserIsSigningUpAsEditorOrViewer("Viewer");
      this.sharingRedirectService.setShare_id_view_only(this.share_id)
      this.mode_to_print = "a Viewer"
    }





  }
  //do loggin with google auth
  //check if new or existing user

  //if new setIfNewUserWhenLand true && redirect to furtherregister
  //(on further register page listen for checkIfNewUSerWhenLandOnShared === true ---> load special elements on the register page)
  //if true on reg page -> once further reg completed do not redirect to dashboard but first register than as ___ for trip_id ____ then
  // once success registered as editor or viewer reset sharing redirect service all to null AND redirect to trip detail



  //if not new user set setIfNewUserWhenLand false

  //check if user is existing editor/viewer for this trip -> if not register them as editor or viewer
  //then if succes editor/viewer reg/ or existing --> reset sharing redirect service to all null ---> redirect to trip details



  //if get

  async loginWithGoogle(): Promise<void> {
    // window.history.replaceState({}, '', '/dashboard');
    const provider = new GoogleAuthProvider();

    signInWithPopup(this.auth, provider)
      .then(async (result) => {
        console.log(result.user)
        console.log("full result " + result)


        //send to auth component to keep trakc of authentication status
        await this.firebaseAuthStore.setAuthState(result.user)
        const userStatus = await this.authService.getUserNewOrExisting(result.user)

        this.user = result.user;
        console.log(this.user)
        // console.log("this user's token id is ", this.user.getIdToken)


        return userStatus;

      })
      .catch(error => {
        console.error(error)
      })
      .then(async (userStatus) => {
        const string = userStatus as string;

        const splitArray = string.split("-");

        const actualStatus = splitArray[0];
        const fullyRegistered = splitArray[1];



        if (actualStatus?.match("new registered") && fullyRegistered?.match("failed")) {
          this.sharingRedirectService.setIfNewUserWhenLandOnShared(true);
          this.router.navigate(['/register']);
        } else if (actualStatus?.match("exists") && fullyRegistered?.match("failed")) {
          this.sharingRedirectService.setIfNewUserWhenLandOnShared(true);
          this.router.navigate(['/register']) //user has not fully registered all details
        } else if (actualStatus?.match("exists") && fullyRegistered?.match("passed")) {
          this.isUploading = true;
          this.userExistingDetails = await this.userService.getUserbyFirebaseId(this.user?.uid ?? '');

          if (this.sharingRedirectService.getIfUserIsSigningUpAsEditorOrViewer() === "Editor") {

            const newEditor: UserRoles = {
              trip_id: this.sharingRedirectService.getCapturedTripIdForRedirect() ?? '',
              user_id: this.user?.uid ?? '',
              user_display_name: this.userExistingDetails?.user_name ?? '',
              user_email: this.user?.email ?? '',
              role: "Editor",
              share_id: this.sharingRedirectService.getShare_id() ?? '',
              share_id_view_only: ""
            }
            const response = await this.userRolesService.registerNewEDITORUser(newEditor);
            if (response === "Registered as editor") {

              this.messagingService.add({
                severity: 'success',
                summary: 'Registered as Editor for trip',
                detail: 'Successfully registered as editor!',
                life: 3000,
              });

              // Wait for the toast to be visible before navigating (adjust timing if needed)
              await new Promise(resolve => setTimeout(resolve, 3000));
              this.isUploading = false;
              // this.router.navigate(["/trip-details", this.trip_id]);
              this.router.navigate(['/dashboard']) //user fulfilled all registration

            }


          } else if (this.sharingRedirectService.getIfUserIsSigningUpAsEditorOrViewer() === "Viewer") {
            const newViewer: UserRoles = {
              trip_id: this.sharingRedirectService.getCapturedTripIdForRedirect() ?? '',
              user_id: this.user?.uid ?? '',
              user_display_name: this.userExistingDetails?.user_name ?? '',
              user_email: this.user?.email ?? '',
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
              // this.router.navigate(["/trip-details", this.trip_id]);
              this.router.navigate(['/dashboard']) //user fulfilled all registration
            }

          }


          // this.router.navigate(['/dashboard']) //user fulfilled all registration
        }
      }
      );

  }


  ngOnDestroy() {
    this.queryParamsSub.unsubscribe()
  }









}
