import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";


@Injectable({
    providedIn: "root"
})
export class SharingRedirectService{

private capturedTripIdForRedirect = new BehaviorSubject<string | null>(null);

private checkIfNewUserWhenLandOnShared = new BehaviorSubject<boolean | null >(null);
//if true forward to registration page with this set true, only when user successfully registered an account + successful registered as editor/viewer of project,
//redirect to capturedTripIdForRedirect

private checkIfUserIsSigningUpAsEditorOrViewer =  new BehaviorSubject<string | null>(null);

private trip_name = new BehaviorSubject<string | null>(null);

private inviter = new BehaviorSubject<string | null>(null);

private share_id = new BehaviorSubject<string | null>(null);

private share_id_view_only = new BehaviorSubject<string | null>(null);

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
            setTrip_name(trip_name: string | null){
                this.trip_name.next(trip_name);
            }

            setInviter(inviter_name: string | null){
                this.inviter.next(inviter_name);
            }

            setShare_id(share_id: string | null){
                this.share_id.next(share_id);
            }

            setShare_id_view_only(share_id: string | null){
                this.share_id_view_only.next(share_id);
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

            getTrip_name(): string | null{
                return this.trip_name.getValue();
            }

            getInviter(): string | null{
                return this.inviter.getValue();
            }

            getShare_id(): string | null{
                return this.share_id.getValue();
            }

            getShare_id_view_only(): string | null{
                return this.share_id_view_only.getValue();
            }



}