import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PicturesService {

  constructor() { }

  savePictureToLocalStorage(picture: string, type: string) {
    localStorage.setItem(type, picture);
  }

  getPictureFromLocalStorage(type: string) {
    return localStorage.getItem(type);
  }

  deletePictureFromLocalStorage(type: string) {
    localStorage.removeItem(type);
  }

  clearLocalStorage() {
    localStorage.clear();
  }
  
}
