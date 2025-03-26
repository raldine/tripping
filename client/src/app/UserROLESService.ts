import { inject, Injectable } from "@angular/core";
import { mapUserRoles, UserRoles } from "./models/models";
import { BehaviorSubject, lastValueFrom } from "rxjs";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class UserROLESService {

    http = inject(HttpClient)

    //for sharing across components
    private oneUserRole = new BehaviorSubject<UserRoles | null>(null);
    private allUsersRolesForTrip = new BehaviorSubject<UserRoles[] | null>(null);


    async getAllUsersRolesForTripFromBE(trip_id: string, firebaseUid: string) {

        const headers = new HttpHeaders({
            "Authorization": firebaseUid
        });

        let params = new HttpParams();
        params = params.set("trip_id", trip_id);

        try {
            // Make the HTTP GET request
            const response = await lastValueFrom(
                this.http.get<any>("https://industrious-perfection-production.up.railway.app/api/roles/get-all-userRoles", { headers, params })
            );

            console.log("Raw response:", response); // Debugging


            if (response?.response === "No user roles found") {
                console.warn("No users roles found. Returning an empty array.");
                return [];
            }


            return response.map((userRole: any) => mapUserRoles(userRole));

        } catch (error) {
            console.error("Error fetching user roles:", error);
            return [];
        }


    }

    registerNewEDITORUser(userRoleInfo: UserRoles): Promise<string> {
        console.info("calling register service");
        console.log("value of user ROLE is ", userRoleInfo);

        return lastValueFrom(this.http.put<{ response: string }>("https://industrious-perfection-production.up.railway.app/api/roles/registerEditor", userRoleInfo))
            .then((response) => {
                console.info("Response received: ", response);
                return response.response;
            })
            .catch(error => {
                console.error("Error during registering editor:", error);
                throw error;  // Re-throwing error after logging
            });
    }

    registerNewVIEWERUser(userRoleInfo: UserRoles): Promise<string> {
        console.info("calling register service");
        console.log("value of user ROLE is ", userRoleInfo);

        return lastValueFrom(this.http.put<{ response: string }>("https://industrious-perfection-production.up.railway.app/api/roles/registerViewer", userRoleInfo))
            .then((response) => {
                console.info("Response received: ", response);
                return response.response;
            })
            .catch(error => {
                console.error("Error during registering viewer:", error);
                throw error;  // Re-throwing error after logging
            });
    }

    async getCurrUserRoleInThisTrip(user_id_firebase: string, trip_id: string) {

        const headers = new HttpHeaders({
            "Authorization": user_id_firebase
        });

        let params = new HttpParams();
        params = params.set("trip_id", trip_id);
        params = params.set("user_id", user_id_firebase);

        try {
            // Make the HTTP GET request
            const response = await lastValueFrom(
                this.http.get<any>("https://industrious-perfection-production.up.railway.app/api/roles/get-user-role", { headers, params })
            );

            console.log("Raw response:", response); // Debugging


            if (response?.response === "Error: No role found") {
                console.warn("No role found for this user in this trip.");
                return "not exist";
            }


            return response.response as string;

        } catch (error) {
            console.error("Error fetching this user's role for this trip:", error);
            return "";
        }

    }

    async getThisTripShareUrl(edit_or_view: string, trip_id: string, user_id_firebase: string) {

        const headers = new HttpHeaders({
            "Authorization": user_id_firebase
        });

        let params = new HttpParams();
        params = params.set("trip_id", trip_id);
        params = params.set("id_to_get", edit_or_view);

        try {
            // Make the HTTP GET request
            const response = await lastValueFrom(
                this.http.get<any>("https://industrious-perfection-production.up.railway.app/api/roles/get-trip-shareId", { headers, params })
            );

            console.log("Raw response:", response); // Debugging


            if (response?.response === "Error: No share_id found") {
                console.warn("No share_id found. Returning an empty string.");
                return "";
            }


            return response.response as string;

        } catch (error) {
            console.error("Error fetching this trips' share_id:", error);
            return "";
        }

    }



    //passing from component to component
    //set
    setOneUserRole(oneUserRole: UserRoles | null) {
        this.oneUserRole.next(oneUserRole);
    }


    setallUsersRolesForTrip(userRoles: UserRoles[] | null) {
        this.allUsersRolesForTrip.next(userRoles);
        console.log("stored in service ", this.allUsersRolesForTrip.getValue())
    }


    //get
    getOneUserRoleFromStore(): UserRoles | null {
        return this.oneUserRole.getValue();
    }

    getAllUSERROLEsfromStore(): UserRoles[] | null {
        return this.allUsersRolesForTrip.getValue();
    }








}