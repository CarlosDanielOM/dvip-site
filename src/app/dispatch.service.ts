import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DispatchService {

  constructor(
    private http: HttpClient
  ) { }

  createDispatchAccount(firstName: string, lastName: string, email: string, password: string) {
    return this.http.post(`${environment.API_URL}/dispatch`, {first_name: firstName, last_name: lastName, email: email, password: password});
  }
}
