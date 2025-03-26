import { Component, inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-unauthorized-page',
  standalone: false,
  templateUrl: './unauthorized-page.component.html',
  styleUrl: './unauthorized-page.component.css'
})
export class UnauthorizedPageComponent implements OnInit{

  titleService = inject(Title);
  ngOnInit(): void {
    this.titleService.setTitle('Logged Out / UnAuthorised | Tripping');
  }


}
