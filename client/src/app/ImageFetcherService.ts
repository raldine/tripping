import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { firstValueFrom } from 'rxjs';  // Import firstValueFrom

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

  http = inject(HttpClient);
  protected pexel_key = "49326135-73dafaa9457dc42648d3aef47";

  get_url = "https://api.pexels.com/v1/search";

  async fetchRandomImage(query: string): Promise<string> {
    const finalQuery = query + " travel";
    const params = new HttpParams()
      .set('query', finalQuery)
      .set('orientation', 'horizontal')
      .set('per_page', '10');

    const headers = { Authorization: this.pexel_key };

    try {
      const response = await firstValueFrom(
        this.http.get<PexelsResponse>(this.get_url, { params, headers })
      );

      // Get a random photo from the photos array
      const randomIndex = Math.floor(Math.random() * response.photos.length);
      return response.photos[randomIndex].src.large2x;
    } catch (error) {
      console.error('Error fetching image:', error);
      throw error;  // Rethrow or handle the error as needed
    }
  }
}
