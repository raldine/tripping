import { Injectable } from "@angular/core";
import { CountryCurrTime, CountryDataSlice } from "./models/models";
import { ComponentStore } from "@ngrx/component-store";
import { firstValueFrom, map } from "rxjs";
import { BackendDataService } from "./BackendDataService";

const INIT: CountryDataSlice = {
    countriesData: []
};

@Injectable({
    providedIn: 'root'
})
export class CountryDataForAppStore extends ComponentStore<CountryDataSlice> {

    constructor(private backendService: BackendDataService) {
        super(INIT);
        console.log("CountryDataForAppStore Initialized");
        this.loadCountryData(); // laod data from backend
    }

    private async loadCountryData(): Promise<void> {
        console.log("🔍 Fetching country data from backend...");
        try {
            const data = await this.backendService.getCountrySummaries();
      

            if (data.length === 0) {
                console.warn("No country data received. Check API response.");
            }

            this.addLoadCountryCurrTimelist(data);
            console.log("Country data stored in Component Store");
        } catch (error) {
            console.error("Error loading country data:", error);
        }
    }

    // Updater (Load data from backend)
    readonly addLoadCountryCurrTimelist = this.updater<CountryCurrTime[]>(
        (slice: CountryDataSlice, countriesDataFromBck: CountryCurrTime[]) => {
            console.log("Storing country data in component store");
            return { countriesData: countriesDataFromBck };
        }
    );

    // Selector: Get full country list
    readonly getCountriesData = this.select((slice: CountryDataSlice) => slice.countriesData);

    // Selector: Filter countries by name
    readonly filterCountryInfoByNames = (countryNames: string[]) =>
        this.getCountriesData.pipe(
            map(countries =>
                countries.filter(eachCountry =>
                    countryNames.some(countryName =>
                        eachCountry.country_name.toLowerCase().includes(countryName.toLowerCase())
                    )
                )
            )
        );


        // Selector: Get a list of unique currencies
        readonly getUniqueCurrencies = this.select(state => 
            [...new Set(state.countriesData.map(country => country.currency))]
        );
    
        //Convert Observable to Promise to get final list of currencies
        async getFinalCurrencies(): Promise<string[]> {
            return firstValueFrom(this.getUniqueCurrencies);
        }

}
