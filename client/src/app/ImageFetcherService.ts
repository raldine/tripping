import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable, provideZoneChangeDetection } from "@angular/core";
import { map, Observable } from "rxjs";

interface PexelsResponse {
  photos: Array<{
    src: {
      large2x: string;
    };
  }>;
}



@Injectable({
  providedIn: 'root'
})
export class ImageFetcherService {

  http = inject(HttpClient)
  protected pexel_key = "49326135-73dafaa9457dc42648d3aef47"

  get_url = "https://api.pexels.com/v1/search"

  fetchRandomImage(query: string): Observable<string> {
    const finalQuery = query + " travel"
    const params = new HttpParams()
      .set('query', finalQuery)
      .set('orientation', 'horizontal')
      .set('per_page', '10');

    const headers = { Authorization: this.pexel_key };

    return this.http
      .get<PexelsResponse>(this.get_url, { params, headers })
      .pipe(
        map((response) => {
          // Get a random photo from the photos array
          const randomIndex = Math.floor(Math.random() * response.photos.length);
          return response.photos[randomIndex].src.large2x;
        })
      );


  }
}