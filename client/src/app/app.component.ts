import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'tripping | Travel together';

  showNavBar=true;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // List of routes where the navbar should be hidden
        const hiddenRoutes = ['/login', '/register', '/unauthorized', '/sharing'];

        // Check if the current route is in the hiddenRoutes list
        this.showNavBar = !hiddenRoutes.includes(event.url);
      }
    });
  }

}
