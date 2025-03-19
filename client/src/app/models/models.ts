import { User } from "firebase/auth"

export interface UserFront{
    user_id: string | null,
    user_name: string,
    firebase_uid: string,
    user_email: string,
    country_origin: string,
    timezone_origin: string,
    currency_origin: string,
    notif: boolean

}

//tracking of AuthState
export interface AuthState{
    user: User | null,
    isAuthenticated: boolean,
    loading: boolean

}


//Country - Currency - Timezone info
export interface CountryCurrTime{
    _id: string,
    country_name: string,
    currency: string,
    timezones: TimeZone[]

}

export interface TimeZone {
    gmtOffsetName: string,
    abbreviation: string,
    tzName: string
}


export interface CountryDataSlice {
    countriesData: CountryCurrTime[]
}


export interface FileUploadedInfo{
    do_url: string, 
    resource_id: string,
    uploadedOn: string,
    resourceType: string,
    fileOriginalName: string

}

export interface TripInfo{
    trip_id: string,
    trip_name: string,
    start_date: string,
    end_date: string,
    destination_city: string,
    destination_curr: string,
    destination_timezone: string,
    d_timezone_name: string,
    dest_lat: string,
    dest_lng: string,
    description_t: string,
    cover_image_id: string,
    attendees: string[],
    master_user_id: string
    last_updated: string,
}

export function mapTripInfo(response: any): TripInfo {
    return {
      trip_id: response.trip_id ?? "N/A",
      trip_name: response.trip_name ?? "N/A",
      start_date: response.start_date ?? "N/A",
      end_date: response.end_date ?? "N/A",
      destination_city: response.destination_city ?? "N/A",
      destination_curr: response.destination_curr ?? "N/A",
      destination_timezone: response.destination_timezone ?? "N/A",
      d_timezone_name: response.d_timezone_name ?? "N/A",
      dest_lat: response.dest_lat ?? "N/A",
      dest_lng: response.dest_lng ?? "N/A",
      description_t: response.description_t ?? "N/A",
      cover_image_id: response.cover_image_id ?? "N/A",
      attendees: response.attendees ? response.attendees.split(/\s*,\s*/) : [],
      master_user_id: response.master_user_id ?? "N/A",
      last_updated: response.last_updated ?? "N/A",
    };
  }

  //how to use mapTripInfo
//   async fetchTrips(): Promise<TripInfo[]> {
//     try {
//       const response = await lastValueFrom(this.http.get<TripInfo[]>("/trip/all"));

//       // ✅ Map each trip object using `mapTripInfo`
//       return response.map((trip) => mapTripInfo(trip));
//     } catch (error) {
//       console.error("Error fetching trips:", error);
//       return []; // Return empty array on failure
//     }
//   }


export interface ItineraryObj {
    itinerary_id: string | null,
    trip_id: string | null,
    itn_date: string
}

export function mapItineraryObj(response: any): ItineraryObj {
    return {
      trip_id: response.trip_id ?? "N/A",
      itinerary_id: response.itinerary_id ?? "N/A",
      itn_date: response.itn_date ?? "N/A"
     
    };
  }

