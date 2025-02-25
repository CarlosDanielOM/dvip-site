import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PicturesService {

  constructor(
    private http: HttpClient
  ) { }

  uploadPicture(formData: any) {
    return this.http.post(`${environment.API_URL}/pictures/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => ({
          status: error.status,
          message: error.message,
          statusText: error.statusText
        }));
      })
    );
  }

  resetPictures(types: string[], van: string) {
    return this.http.delete(`${environment.API_URL}/pictures`, {
      params: {
        type: types,
        van: van
      }
    });
  }

  savePictures(driverName: string, driverId: string, vanType: string, vanNumber: number, date: number) {
    return this.http.post(`${environment.API_URL}/pictures`, {
      "driver-name": driverName,
      "driver-id": driverId,
      "van-type": vanType,
      "van-number": vanNumber,
      date: date
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => ({
          status: error.status,
          message: error.message,
          statusText: error.statusText
        }));
      })
    )
  }

  savePictureToLocalStorage(picture: string, type: string) {
    localStorage.setItem(type, picture);
  }

  getPictureFromLocalStorage(type: string) {
    return localStorage.getItem(type);
  }

  deletePictureFromLocalStorage(type: string) {
    localStorage.removeItem(type);
  }
  
}
