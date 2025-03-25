import { User } from "firebase/auth"

export interface UserFront {
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
export interface AuthState {
    user: User | null,
    isAuthenticated: boolean,
    loading: boolean

}


//Country - Currency - Timezone info
export interface CountryCurrTime {
    _id: string,
    country_name: string,
    currency: string,
    iso2: string,
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


export interface FileUploadedInfo {
    do_url: string,
    resource_id: string,
    uploadedOn: string,
    resourceType: string,
    fileOriginalName: string

}

export interface TripInfo {
    trip_id: string,
    trip_name: string,
    start_date: string,
    end_date: string,
    destination_city: string,
    destination_curr: string,
    destination_timezone: string,
    d_timezone_name: string,
    d_iso2: string,
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
        d_iso2: response.d_iso2 ?? "N/A",
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


export interface GooglePlaceInfo {
    location_id: string | null,
    location_lat: string | null,
    location_lng: string | null,
    location_address: string,
    location_name: string | null,
    google_place_id: string | null,
    g_biz_number: string | null,
    g_biz_website: string | null,
    g_opening_hrs: string[] | null
}

export interface TimeZoneSelectItem {
    name: string,
    code: string
}

export interface AccommodationObj {
    accommodation_id: string,
    accommodation_name: string,
    trip_id: string,
    check_in_date: string,
    check_in_time: string,
    check_out_date: string,
    check_out_time: string,
    timezone_time: string,
    event_notes: string,
    location_id: string,
    last_updated_by: string,
    last_updated: string
}

export function mapAccommObj(response: any): AccommodationObj {
    return {
        accommodation_id: response.accommodation_id ?? "N/A",
        accommodation_name: response.accommodation_name ?? "N/A",
        trip_id: response.trip_id ?? "N/A",
        check_in_date: response.check_in_date ?? "N/A",
        check_in_time: response.check_in_time ?? "N/A",
        check_out_date: response.check_out_date ?? "N/A",
        check_out_time: response.check_out_time ?? "N/A",
        timezone_time: response.timezone_time ?? "N/A",
        event_notes: response.event_notes ?? "N/A",
        location_id: response.location_id ?? "N/A",
        last_updated_by: response.last_updated_by ?? "N/A",
        last_updated: response.last_updated ?? "N/A"
    };
}

export interface LocationObj {
    location_id: string,
    location_lat: string,
    location_lng: string,
    location_address: string,
    location_name: string,
    google_place_id: string,
    g_biz_number: string,
    g_biz_website: string,
    g_opening_hrs: string[],
    trip_id: string,
    itinerary_id: string,
    last_updated: string
}

export function mapLocationObj(response: any): LocationObj {
    return {
        location_id: response.location_id ?? "N/A",
        location_lat: response.location_lat ?? "N/A",
        location_lng: response.location_lng ?? "N/A",
        location_address: response.location_address ?? "N/A",
        location_name: response.location_name ?? "N/A",
        google_place_id: response.google_place_id ?? "N/A",
        g_biz_number: response.g_biz_number ?? "N/A",
        g_biz_website: response.g_biz_website ?? "N/A",
        g_opening_hrs: response.g_opening_hrs ?? ["N/A"], // Assuming it could be an array
        trip_id: response.trip_id ?? "N/A",
        itinerary_id: response.itinerary_id ?? "N/A",
        last_updated: response.last_updated ?? "N/A"
    };
}


export interface ActivityObj {
    activity_id: string,
    trip_id: string,
    itinerary_id: string,
    event_name: string,
    activity_type: string,
    start_date: string,
    start_time: string,
    end_date: string,
    end_time: string,
    timezone_time: string,
    event_notes: string,
    location_id: string,
    last_updated_by: string,
    last_updated: string

}

export function mapActivityObj(response: any): ActivityObj {
    return {
        activity_id: response.activity_id ?? "N/A",
        trip_id: response.trip_id ?? "N/A",
        itinerary_id: response.itinerary_id ?? "N/A",
        event_name: response.event_name ?? "N/A",
        activity_type: response.activity_type ?? "N/A",
        start_date: response.start_date ?? "N/A",
        start_time: response.start_time ?? "N/A",
        end_date: response.end_date ?? "N/A",
        end_time: response.end_time ?? "N/A",
        timezone_time: response.timezone_time ?? "N/A",
        event_notes: response.event_notes ?? "N/A",
        location_id: response.location_id ?? "N/A",
        last_updated_by: response.last_updated_by ?? "N/A",
        last_updated: response.last_updated ?? "N/A"
    };
}


export interface UserRoles {
    trip_id: string,
    user_id: string,
    user_display_name: string,
    user_email: string,
    role: string,
    share_id: string,
    share_id_view_only: string

}

export function mapUserRoles(response: any): UserRoles {
    return {
        trip_id: response.trip_id ?? "N/A",
        user_id: response.user_id ?? "N/A",
        user_display_name: response.user_display_name ?? "N/A",
        user_email: response.user_email ?? "N/A",
        role: response.role ?? "N/A",
        share_id: response.share_id ?? "N/A", // Set "N/A" if share_id is null or undefined
        share_id_view_only: response.share_id_view_only ?? "N/A" // Set "N/A" if share_id_view_only is null or undefined
    };
}


export interface ActivityTypeOption {
    name: string;
    icon: string;
}

export function encodeAddressForGoogleMaps(address: string): string {
    return encodeURIComponent(address.trim());
}

export function getGoogleMapsSearchUrl(address: string, google_place_id: string | null): string {
    const encodedAddress = encodeAddressForGoogleMaps(address);

    if(google_place_id!==null){

        const wDestinationId = `https://www.google.com/maps/dir/?api=1&destination_place_id=${google_place_id}&destination=${encodedAddress}`;

        return wDestinationId;

    }

    if(google_place_id!=="N/A"){

        const wDestinationId = `https://www.google.com/maps/dir/?api=1&destination_place_id=${google_place_id}&destination=${encodedAddress}`;

        return wDestinationId;

    }
    
    return `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
  }