import { NgModule } from '@angular/core';
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






const appRoutes: Routes = [
  {path:"login", component: LoginAppComponent},
  {path:"dashboard", component: DashboardComponent},
  {path:"register", component: RegisterComponent},
  {path:"unauthorized", component: UnauthorizedPageComponent},
  {path:"addedittrip/:trip_id", component: TripEditiorComponent},
  { path: '', redirectTo: '/login', pathMatch: 'full' }
]


@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    UnauthorizedPageComponent,
    DashboardComponent,
    TripEditiorComponent,
    NavbarComponent,
    DateFormatPipe
   
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
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
    FluidModule
    


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

