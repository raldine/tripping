import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { User } from 'firebase/auth';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Subscription, filter, map, Observable } from 'rxjs';
import { FireBaseAuthStore } from './FireBaseAuth.store';
import { AuthState, UserFront } from './models/models';
import { Router } from '@angular/router';
import { UserDetailsStore } from './UserDetails.store';
import { AuthService } from './AuthService';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {

  items: MenuItem[] | undefined;

  authService = inject(AuthService);
  private firebaseAuthStore = inject(FireBaseAuthStore);
  private userDetailsStore = inject(UserDetailsStore);
  router = inject(Router);
  confirmationService = inject(ConfirmationService);
  messagingService = inject(MessageService);

  protected currUser!: User | null;
  protected currUserDetails!: UserFront;
  user_pp_url!: string | null;

  private authStateSubscription!: Subscription;
  private loggedInUserDetailsSub?: Subscription;

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

  ngOnInit(): void {
    console.log("NavbarComponent initialized");

    // Init nav bar menu
    this.items = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        routerLink: '/dashboard'
      },
    ];

    // Listen for Firebase auth state
    this.authStateSubscription = this.firebaseAuthStore.getAuthState$.subscribe((authState) => {
      if (!authState.isAuthenticated) {
        console.log("Navbar: user not authenticated, skipping detail loading");
        return;
      }

      if (authState.user && authState.user.uid) {
        this.currUser = authState.user;
        this.user_pp_url = this.currUser.photoURL?.replace("=s96-c", "") ?? null;
        console.log("Navbar: user authenticated, loading details...");

        // Load user details from backend
        this.userDetailsStore.loadUserDetails(this.currUser.uid);

        // Subscribe to user details
        this.loggedInUserDetailsSub = this.userDetailsStore.userDetails$.subscribe((user) => {
          this.currUserDetails = { ...this.DEFAULT_USER, ...user };
          console.log("User details loaded:", this.currUserDetails);
        });
      }
    });
  }

  logout() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to logout?',
      header: 'Confirm Logout',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'Cancel',
      accept: async () => {
        this.authService.logout();

        this.messagingService.add({
          severity: 'success',
          summary: 'Logged Out',
          detail: 'You have been successfully logged out!',
          life: 3000,
        });

        await new Promise(resolve => setTimeout(resolve, 3000));
        this.router.navigate(['/login']);
      },
    });
  }

  ngOnDestroy(): void {
    this.authStateSubscription?.unsubscribe();
    this.loggedInUserDetailsSub?.unsubscribe();
  }
}
