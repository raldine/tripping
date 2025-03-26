import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { CountryCurrTime } from "./models/models";
import { lastValueFrom } from "rxjs";

@Injectable({
    providedIn: "root"
})
export class BackendDataService {

    private http = inject(HttpClient); 


    getCountrySummaries(): Promise<CountryCurrTime[]> {
        console.info("backend service for country called")
        return lastValueFrom(this.http.get<CountryCurrTime[]>('https://industrious-perfection-production.up.railway.app/api/getCountryData'))

    

}

}