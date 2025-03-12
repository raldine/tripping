import { Component, inject, OnInit } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, User } from '@angular/fire/auth';
import { AuthService } from './AuthService';
import { Router } from '@angular/router';
import { FireBaseAuthStore } from './FireBaseAuth.store';
import { AuthState } from './models/models';

declare const gapi: any; // Declare gapi globally

@Component({
  selector: 'app-login-app',
  standalone: false,
  templateUrl: './login-app.component.html',
  styleUrl: './login-app.component.css'
})
export class LoginAppComponent implements OnInit{


  auth = inject(Auth);
  // authService = inject(AuthService);
  firebaseAuthStore = inject(FireBaseAuthStore)
  router = inject(Router);
  user: User | null = null;  // To store the logged-in user


  //for checking with backend
  authService = inject(AuthService)



  ngOnInit(): void {


  }


  async loginWithGoogle(): Promise<void> {
    // window.history.replaceState({}, '', '/dashboard');
    const provider = new GoogleAuthProvider();
  
     signInWithPopup(this.auth, provider)
    .then(async (result) => {
      console.log(result.user)
      console.log("full result " +  result)
      

      //send to auth component to keep trakc of authentication status
      await this.firebaseAuthStore.setAuthState(result.user)
      const userStatus = await this.authService.getUserNewOrExisting(result.user)

      this.user = result.user;
      console.log("this user's token id is ", this.user.getIdToken)
      
  
      return userStatus;
     
    })
    .catch(error => 
    {
      console.error(error)
    })
    .then((userStatus) =>{
      const string = userStatus as string;

      const splitArray = string.split("-");

      const actualStatus = splitArray[0];
      const fullyRegistered = splitArray[1];



      if(actualStatus?.match("new registered") && fullyRegistered?.match("failed")){
        this.router.navigate(['/register']);
      } else if (actualStatus?.match("exists") && fullyRegistered?.match("failed")){
      this.router.navigate(['/register']) //user has not fully registered all details
      } else if (actualStatus?.match("exists") && fullyRegistered?.match("passed")){
        this.router.navigate(['/dashboard']) //user fulfilled all registration
      }
    }
    );
    
  }

}
