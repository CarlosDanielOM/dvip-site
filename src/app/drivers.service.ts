import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { BehaviorSubject, catchError, filter, map, tap, throwError } from 'rxjs';
import { Driver } from './driver';

@Injectable({
  providedIn: 'root'
})
export class DriversService {
  drivers: Driver[] =[];
  
  private driverSubject = new BehaviorSubject<any[]>([]);
  drivers$ = this.driverSubject.asObservable();

  constructor(
    private http: HttpClient
  ) { }

  getDrivers() {
    return this.http.get(`${environment.API_URL}/drivers`).pipe(
      map((data: any) => {
        this.drivers = data.data.drivers;
        this.driverSubject.next([...this.drivers]);
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => ({
          status: error.status,
          message: error.message,
          statusText: error.statusText
        }))
      })
    );
  }

  addDriver(data: any) {
    return this.http.post(`${environment.API_URL}/drivers`, data).pipe(
      map((data: any) => {
        this.drivers = [...this.drivers, data.data.driver];
        this.driverSubject.next(this.drivers);
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => ({
          status: error.status,
          message: error.message,
          statusText: error.statusText
        }))
      })
    );
  }

  deleteDriver(id: string) {
    return this.http.delete(`${environment.API_URL}/drivers/${id}`).pipe(
      tap((data: any) => {
        this.drivers = this.drivers.filter((driver: any) => driver._id !== id);
        this.driverSubject.next(this.drivers);
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => ({
          status: error.status,
          message: error.message,
          statusText: error.statusText
        }))
      })
    );
  }
  
}
