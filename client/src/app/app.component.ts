import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FireBaseAuthStore } from './FireBaseAuth.store';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'tripping | Travel together';

  showNavBar=true;



  constructor(private router: Router, private firebaseAuthStore: FireBaseAuthStore) {
    this.firebaseAuthStore.firebaseReady$.subscribe(() => {
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          const hiddenRoutePrefixes = ['/login', '/register', '/unauthorized', '/sharing'];
          const currentUrl = event.urlAfterRedirects || event.url;
          console.log('[Router] NavigationEnd:', currentUrl);
          this.showNavBar = !hiddenRoutePrefixes.some(prefix => currentUrl.startsWith(prefix));
        }
      });
    });
  }

}
