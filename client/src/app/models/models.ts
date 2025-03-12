import { User } from "firebase/auth"

export interface UserFront{
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