import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";


@Injectable({
    providedIn: "root"
})
export class SharingRedirectService{

private capturedTripIdForRedirect = new BehaviorSubject<string | null>(null);

private checkIfNewUserWhenLandOnShared = new BehaviorSubject<boolean | null >(false);
//if true forward to registration page with this set true, only when user successfully registered an account + successful registered as editor/viewer of project,
//redirect to capturedTripIdForRedirect

private checkIfUserIsSigningUpAsEditorOrViewer =  new BehaviorSubject<string | null>(null);

//passing from component to component
            //set
            setCapturedTripIdForRedirect(trip_id: string | null) {
                this.capturedTripIdForRedirect.next(trip_id);
            }
        
        
            setIfNewUserWhenLandOnShared(boolean: boolean | null) {
                this.checkIfNewUserWhenLandOnShared.next(boolean);
                if (boolean === true){

                    console.log("new user detected, redirecting to further registraiton")

                }
               
            }

            setCheckIfUserIsSigningUpAsEditorOrViewer(editor_or_view: string | null) {
                this.checkIfUserIsSigningUpAsEditorOrViewer.next(editor_or_view);
                if (editor_or_view === "Editor"){

                    console.log("curr user is joining trip as editor")

                } else {
                    console.log("curr user is joining trip as ", this.checkIfUserIsSigningUpAsEditorOrViewer.getValue())
                }
               
            }
        
        
            //get
            getCapturedTripIdForRedirect(): string | null {
                return this.capturedTripIdForRedirect.getValue();
            }

            getIfNewUserWhenLandOnShared(): boolean | null {
                return this.checkIfNewUserWhenLandOnShared.getValue();
            }
        
        
            getIfUserIsSigningUpAsEditorOrViewer(): string | null {
                return this.checkIfUserIsSigningUpAsEditorOrViewer.getValue();
            }



}