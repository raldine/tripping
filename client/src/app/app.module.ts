import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { LoginAppComponent } from './login-app.component';
import { DashboardComponent } from './dashboard.component';
import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';
import { RegisterComponent } from './register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './AuthService';
import { GoogleApiCallService } from './GoogleApiCallService';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { AvatarModule } from 'primeng/avatar';
import { MenubarModule } from 'primeng/menubar';
import { UnauthorizedPageComponent } from './unauthorized-page.component';
import { BackendDataService } from './BackendDataService';
import { FireBaseAuthStore } from './FireBaseAuth.store';
import { CountryDataForAppStore } from './CountryDataForApp.store';
import { ButtonModule } from 'primeng/button'; 
import { IconField, IconFieldModule } from 'primeng/iconfield';
import { InputIcon, InputIconModule } from 'primeng/inputicon';
import { UserService } from './UserService';
import { FileUploadService } from './FileUploadService';
import { TripService } from './TripService';
import { TripEditiorComponent } from './trip-editior.component';
import { NavbarComponent } from './navbar.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';  // Import CalendarModule for p-datepicker
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { ToolbarModule } from 'primeng/toolbar';
import {FluidModule} from 'primeng/fluid';
import { DateFormatPipe } from './date-format.pipe';
import { TripDetailComponent } from './trip-detail.component';
import { AccommDetailComponent } from './accomm-detail.component';
import { TripStore } from './TripsStore.store';
import { TabsModule } from 'primeng/tabs';
import { DateFormatDayPipe } from './date-format-day.pipe';
import { CardModule } from 'primeng/card';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { StepperModule } from 'primeng/stepper';
import { SelectModule } from 'primeng/select';
import { TimeFormatPipe } from './time-format.pipe';
import { AccommViewComponent } from './accomm-view.component';
import { TripViewComponent } from './trip-view.component';
import { ActivityEditorComponent } from './activity-editor.component';
import { ActivityViewComponent } from './activity-view.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ShareEditorLandingComponent } from './share-editor-landing.component';







const appRoutes: Routes = [
  {path:"login", component: LoginAppComponent},
  {path:"dashboard", component: DashboardComponent},
  {path:"register", component: RegisterComponent},
  {path:"unauthorized", component: UnauthorizedPageComponent},
  {path:"addedittrip/:trip_id", component: TripEditiorComponent},
  {path: "trip-details/:trip_id", component: TripDetailComponent},
  {path: "viewtripdeets/:trip_id", component: TripViewComponent},
  {path:"addeditaccomm/:acc_id", component: AccommDetailComponent},
  {path: "viewaccomm/:acc_id", component: AccommViewComponent},
  {path: "addeditact/:act_id", component: ActivityEditorComponent},
  {path: "viewactivity/:act_id", component: ActivityViewComponent},
  {path: "sharing/:trip_id/:share_id", component: ShareEditorLandingComponent},
  {path: '', redirectTo: '/login', pathMatch: 'full' }
]


@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    UnauthorizedPageComponent,
    DashboardComponent,
    TripEditiorComponent,
    NavbarComponent,
    DateFormatPipe,
    TripDetailComponent,
    AccommDetailComponent,
    DateFormatDayPipe,
    TimeFormatPipe,
    AccommViewComponent,
    TripViewComponent,
    ActivityEditorComponent,
    ActivityViewComponent,
    ShareEditorLandingComponent
   
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes, {useHash: true}),
    ReactiveFormsModule,
    InputTextModule,
    RadioButtonModule,
    AvatarModule,
    MenubarModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    ProgressSpinnerModule,
    ToastModule,
    CalendarModule,
    DatePickerModule,
    TextareaModule,
    ToolbarModule,
    FluidModule,
    TabsModule,
    CardModule,
    AvatarGroupModule,
    StepperModule,
    SelectModule,
    ConfirmDialogModule
 
    
    


  ],
  providers: [
    provideFirebaseApp(() => initializeApp({ projectId: "tripping-b41ab", appId: "1:835286027214:web:25013efc51c08700a5b99f", storageBucket: "tripping-b41ab.firebasestorage.app", apiKey: "AIzaSyBvNBRx4UtrfGtBUttiOXpomk7G62Mlbts", authDomain: "tripping-b41ab.firebaseapp.com", messagingSenderId: "835286027214", measurementId: "G-2SBSH9W0KX" })),
    provideAuth(() => getAuth()),
    provideHttpClient(),
    AuthService,
    UserService,
    FileUploadService,
    TripService,
    GoogleApiCallService,
    BackendDataService,
    FireBaseAuthStore,
    CountryDataForAppStore,
    MessageService,
    TripStore,
    DateFormatDayPipe,
    DateFormatPipe,
    ConfirmationService,
    // {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
    // provideNativeDateAdapter(),
    // // provideDateFnsAdapter(),
    provideAnimationsAsync(),
    providePrimeNG({
        theme: {
            preset: Aura,
            options: {
              darkModeSelector: false
          }
        }
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
function provideDateFnsAdapter(): import("@angular/core").Provider | import("@angular/core").EnvironmentProviders {
  throw new Error('Function not implemented.');
}

