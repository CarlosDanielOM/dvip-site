import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-login',
  imports: [RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  login: string = 'driver';
  private formBuilder = inject(FormBuilder);

  dispatchForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  driverForm = this.formBuilder.group({
    driverPin: ['', [Validators.required, Validators.minLength(4), Validators.pattern('[0-9]{4}')]]
  })

  constructor(
    private activeRoute: ActivatedRoute,
    private loginService: LoginService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.activeRoute.params.subscribe(params => {
      this.login = params['type'];
    });
  }

  onSubmit() {
    if(this.login == 'driver') {
      if(this.loginService.loginDriver(Number(this.driverPin!.value!))) {
        this.router.navigate(['dvip/pictures']);
      } else {
        alert('Driver Login Failed');
      }
    } else {
      this.loginService.loginDispatch(this.email!.value!, this.password!.value!).subscribe((data: any) => {
        if(data.valid) {
          this.router.navigate(['dashboard']);
        }
      });
    }
  }
  
  get email() {
    return this.dispatchForm.get('email');
  }

  get password() {
    return this.dispatchForm.get('password');
  }

  get driverPin() {
    return this.driverForm.get('driverPin');
  }
  
}
