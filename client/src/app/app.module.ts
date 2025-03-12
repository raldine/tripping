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
// import { JwtInterceptor } from './interceptor/JwtInterceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { InputTextModule } from 'primeng/inputtext';
// import { FloatLabelModule } from 'primeng/floatlabel'
// import { IftaLabelModule } from 'primeng/iftalabel';
import { RadioButtonModule } from 'primeng/radiobutton';
import { AvatarModule } from 'primeng/avatar';
import { UnauthorizedPageComponent } from './unauthorized-page.component';
import { BackendDataService } from './BackendDataService';
import { FireBaseAuthStore } from './FireBaseAuth.store';
import { CountryDataForAppStore } from './CountryDataForApp.store';

const appRoutes: Routes = [
  {path:"login", component: LoginAppComponent},
  {path:"dashboard", component: DashboardComponent},
  {path:"register", component: RegisterComponent},
  {path:"unauthorized", component: UnauthorizedPageComponent},
  { path: '', redirectTo: '/login', pathMatch: 'full' }
]


@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    UnauthorizedPageComponent
   
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    ReactiveFormsModule,
    InputTextModule,
    // FloatLabelModule,
    // IftaLabelModule,
    RadioButtonModule,
    AvatarModule
  ],
  providers: [
    provideFirebaseApp(() => initializeApp({ projectId: "tripping-b41ab", appId: "1:835286027214:web:25013efc51c08700a5b99f", storageBucket: "tripping-b41ab.firebasestorage.app", apiKey: "AIzaSyBvNBRx4UtrfGtBUttiOXpomk7G62Mlbts", authDomain: "tripping-b41ab.firebaseapp.com", messagingSenderId: "835286027214", measurementId: "G-2SBSH9W0KX" })),
    provideAuth(() => getAuth()),
    provideHttpClient(),
    AuthService,
    GoogleApiCallService,
    BackendDataService,
    FireBaseAuthStore,
    CountryDataForAppStore,
    // {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true}
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
