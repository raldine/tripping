import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { firstValueFrom } from 'rxjs';  // Import firstValueFrom



@Injectable({
  providedIn: 'root'
})
export class ImageFetcherService {

  http = inject(HttpClient);


  async fetchRandomImage(query: string): Promise<string | null> {
    const finalQuery = query + " travel";
    const params = new HttpParams().set('q', finalQuery);

    try {
      const response = await firstValueFrom(
        this.http.get<{ photourl?: string, error?: string }>("https://industrious-perfection-production.up.railway.app/api/pexels", { params })
      );

      if (response.photourl) {
        return response.photourl;  // ✅ Return image URL
      } else {
        console.warn("No image found:", response.error);
        return null;  // ✅ Handle no image found case
      }
      
    } catch (error) {
      console.error("Error fetching image:", error);
      return null;  // ✅ Return null on failure
    }
}


}
