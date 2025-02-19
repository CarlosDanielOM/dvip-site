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
    return this.http.post(`${environment.API_URL}/pictures/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  resetPictures(types: string[], van: string) {
    return this.http.delete(`${environment.API_URL}/pictures`, {
      params: {
        type: types,
        van: van
      }
    });
  }

  savePictures(types: string[], van: string) {
    return this.http.post(`${environment.API_URL}/pictures`, {
      types: types,
      van: van
    });
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
