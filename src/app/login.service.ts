import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(
    private http: HttpClient
  ) { }

  loginDispatch(email: string, password: string) {
    return this.http.post(`${environment.API_URL}/dispatch/login`, {email: email, password: password}).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  } 

  loginDriver(driverPin: number) {
    return this.http.post(`${environment.API_URL}/drivers/login`, {pin: driverPin}).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }
  
}
