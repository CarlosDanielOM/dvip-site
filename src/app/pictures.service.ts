import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PicturesService {

  constructor(
    private http: HttpClient
  ) { }

  uploadPicture(formData: any) {
    return this.http.post(`${environment.API_URL}/pictures`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  savePictureToSessionStorage(picture: string, type: string) {
    sessionStorage.setItem(type, picture);
  }

  getPictureFromSessionStorage(type: string) {
    return sessionStorage.getItem(type);
  }

  deletePictureFromSessionStorage(type: string) {
    sessionStorage.removeItem(type);
  }
  
}
