import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { FileUploadedInfo, TripInfo } from './models/models';


@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  constructor(private httpClient: HttpClient) { }


  upload(form: any, filebytes: Blob, firebaseUid: string) :Promise<FileUploadedInfo>{
    const formData = new FormData();
    formData.set('comments', form['comments']);
    formData.set('file', filebytes);
    formData.set("trip_id", form['trip_id'])
    formData.set("accommodation_id", form['accommodation_id'] ?? null)
    formData.set("activity_id", form['activity_id'] ?? null)
    formData.set("flight_id", form['flight_id'] ?? null)
    formData.set("user_id_pp", form['user_id_pp']);
    formData.set('original_file_name', form['original_file_name']);

    console.log("check what is sent", formData.values)
    const headers = new HttpHeaders({
        'Authorization' : firebaseUid
    })

    return lastValueFrom(
      this.httpClient.post<FileUploadedInfo>('api/upload', formData, { headers })
    );

  }


  getFileByResourceId(resourceId: string, firebaseUid: string) :Promise<FileUploadedInfo>{
    console.log(resourceId)
    const headers = new HttpHeaders({
        'Authorization' : firebaseUid
    }
    )
    return lastValueFrom(this.httpClient.get<FileUploadedInfo>(`/api/get-resources/${resourceId}`, { headers }))
  }

  getFilesByTripId(trip_id: string, firebaseUid: string) :Promise<FileUploadedInfo[]>{
    console.log(trip_id);
    const headers = new HttpHeaders({
      'Authorization': firebaseUid
    });
  
    return lastValueFrom(this.httpClient.get<FileUploadedInfo[]>(`/api/get-resources-trip/${trip_id}`, { headers }));
  }


  


}
