import { inject, Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { TripInfo } from "./models/models";
import { TripService } from "./TripService";
import { switchMap, tap } from "rxjs/operators";
import { Observable, of } from "rxjs";

export interface TripState {
  selected_tripInfo: TripInfo | null;
  user_trips: TripInfo[];
}

@Injectable({
  providedIn: "root"
})
export class TripStore extends ComponentStore<TripState> {

  tripService = inject(TripService);
  
  constructor() {
    super({ selected_tripInfo: null, user_trips: [] });
   
  }

  // SELECTORS
  readonly selected_tripInfo$ = this.select((state) => state.selected_tripInfo);
  readonly user_trips$ = this.select((state) => state.user_trips);

  

  // UPDATERS
  readonly setuserTrips = this.updater((state, user_trips: TripInfo[]) => ({
    ...state,
    user_trips: user_trips
  }));

  readonly setSelectedTripInfo = this.updater((state, trip: TripInfo | null) => {
    const newState = {
      ...state,
      selected_tripInfo: trip // `trip` can now be `null` as well
    };
  
    if (newState.selected_tripInfo) {
      console.log("Updated selected_tripInfo:", newState.selected_tripInfo.trip_name); // Log the updated state when `trip` is not null
    } else {
      console.log("Recieved null trip or Cleared selected_tripInfo: set to null");
    }
  
    return newState;
  });
  
  // REMOVE TRIP FROM STORE AFTER SUCCESSFUL DELETE
  readonly removeTripFromState = this.updater((state, tripId: string) => ({
    ...state,
    user_trips: state.user_trips.filter(trip => trip.trip_id !== tripId) // Remove trip
  }));

  // EFFECT: DELETE TRIP AFTER SUCCESSFUL BACKEND RESPONSE
  readonly deleteTrip = this.effect(
    (params$: Observable<{ tripId: string; firebaseUid: string }>) => {
      return params$.pipe(
        switchMap(({ tripId, firebaseUid }) =>
          this.tripService.deleteTripByTripid(tripId, firebaseUid)
            .then(() => tripId) // Resolve tripId if successful
            .catch((error) => {
              console.error("Failed to delete trip:", error);
              return null; // Prevent store update on failure
            })
        ),
        tap((tripId) => {
          if (tripId) {
            this.removeTripFromState(tripId);
            console.log(`Trip ${tripId} successfully deleted on frontend and backend.`);
          }
        })
      );
    }
  );
  

  // LOAD TRIPS FROM BACKEND
  readonly loadTrips = this.effect((userId$: Observable<string>) => {
    return userId$.pipe(
      switchMap((userId) => this.tripService.getAllTripsByUserId(userId)), // Fetch from backend
      tap((trips) => this.setuserTrips(trips)) // Update store with fetched trips
    );
  });
}
