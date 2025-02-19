import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(
    private http: HttpClient
  ) { }

  loginDispatch(email: string, password: string) {
    return this.http.post(`${environment.API_URL}/dispatch/login`, {email: email, password: password});
  } 

  loginDriver(driverPin: number) {
    if(driverPin === 5345) {
      localStorage.setItem('driver', JSON.stringify({
        'firstName': 'Carlos',
        'lastName': 'Ordonez'
      }));
      return true;
    } 
    return false;
  }
  
}
