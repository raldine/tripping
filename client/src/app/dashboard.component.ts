import { Component, inject } from '@angular/core';
import { AuthService } from './AuthService';
import { filter, map, Observable, Subscription } from 'rxjs';
import { User } from 'firebase/auth';
import { FireBaseAuthStore } from './FireBaseAuth.store';
import { AuthState } from './models/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  //User Authentication info
  private firebaseAuthStore = inject(FireBaseAuthStore)
  protected authStateCaptured$!: Observable<AuthState>
  protected currUser!: User | null
  private authStateSubscription!: Subscription //so that component can keep listening if user still authenticated at any point
  //in component lifecycle
  //To track currUser changes
  private accessCurrUserDetailsSub!: Subscription

  private router = inject(Router)



  ngOnInit(): void {
    this.authStateCaptured$ = this.firebaseAuthStore.getAuthState$
    this.authStateSubscription = this.authStateCaptured$.subscribe((authState) => {
      if (!authState.isAuthenticated) {
        this.router.navigate(['/unauthorized']); // Navigate to unauthorized page
        return; // Exit early if the user is not authenticated
      }
    })

    this.accessCurrUserDetailsSub = this.firebaseAuthStore.getAuthState$.pipe(
      map((authState) => authState.user),
      filter((user): user is User => user !== null)
    ).subscribe((user) => {
      this.currUser = user;  // Store the user object in the component

      //extract or assign user details to this components local var
      
      console.log('Current user:', this.currUser);
    });








  }


  ngOnDestroy(): void {
    this.authStateSubscription.unsubscribe()
    this.accessCurrUserDetailsSub.unsubscribe()
  }

}
