import { Component, inject } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { DriversService } from '../drivers.service';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { CountPipe } from '../count.pipe';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Driver } from '../driver';

@Component({
  selector: 'app-dashboard',
  imports: [NavbarComponent, CommonModule, CountPipe, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  private formBuilder = inject(FormBuilder);
  drivers: Observable<any[]> = of([]);

  addDriverForm = this.formBuilder.group({
    first_name: ['', [Validators.required]],
    last_name: ['', [Validators.required]],
    pin: ['', [Validators.required, Validators.minLength(4)]],
    active: [true],
    daily_limit: [99, [Validators.required]],
    total_limit: [0, [Validators.min(0), Validators.max(100)]],
    daily_used: [0, [Validators.min(0), Validators.max(100)]],
    total_used: [0, [Validators.min(0), Validators.max(100)]],
    created_by: ['', [Validators.required]],
  });

  formVisible: boolean = false;

  constructor(
    private driversService: DriversService,
  ) {
    this.drivers = this.driversService.drivers$;
  }

  ngOnInit(): void {
    this.driversService.getDrivers().subscribe();

    let dispatchId = JSON.parse(sessionStorage.getItem('dispatcher')!)._id;
    this.addDriverForm.controls['created_by'].setValue(dispatchId);
  }

  addDriver() {
    let random = Math.floor(Math.random() * 999999);
    let driverData: Driver = {
      first_name: this.addDriverForm.value.first_name!,
      last_name: this.addDriverForm.value.last_name!,
      pin: this.addDriverForm.value.pin!,
      active: this.addDriverForm.value.active!,
      daily_limit: this.addDriverForm.value.daily_limit ?? 1,
      total_limit: this.addDriverForm.value.total_limit ?? 0,
      daily_used: this.addDriverForm.value.daily_used ?? 0,
      total_used: this.addDriverForm.value.total_used ?? 0,
      created_by: this.addDriverForm.value.created_by!,
    }
    this.driversService.addDriver(driverData).subscribe({
      next: () => {
        this.resetForm();
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }

  resetForm() {
    this.formVisible = false;
    this.addDriverForm.reset();
    this.addDriverForm.controls['created_by'].setValue(JSON.parse(sessionStorage.getItem('dispatcher')!)._id);
    this.addDriverForm.controls['daily_limit'].setValue(1);
    this.addDriverForm.controls['total_limit'].setValue(0);
    this.addDriverForm.controls['daily_used'].setValue(0);
    this.addDriverForm.controls['total_used'].setValue(0);
    this.addDriverForm.controls['active'].setValue(true);
  }
  
  deleteDriver(id: string) {
    let confirmation = confirm('Are you sure you want to delete this driver?');
    if(!confirmation) {
      return;
    }
    
    this.driversService.deleteDriver(id).subscribe({
      next: () => {
        console.log('Driver Deleted');
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }
  
}
