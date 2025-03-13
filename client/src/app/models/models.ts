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
    description_t: string,
    cover_image_id: string,
    attendees: string,
    master_user_id: string
    last_updated: string,
}