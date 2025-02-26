import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, Renderer2 } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { PicturesService } from '../pictures.service';
import { HttpEventType } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import imageCompression from 'browser-image-compression';

@Component({
  selector: 'app-dvip',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dvip.component.html',
  styleUrl: './dvip.component.css'
})
export class DvipComponent {
  EDVRegex = /^[0-9]{4}$/;
  GasRegx = /^[0-9]{2}$/;
  
  vanNumber = new FormControl({value: '', disabled: false}, [Validators.required]);
  vanNumberError: boolean = false;

  types: string[] = ['front-view', 'back-view', 'left-view', 'right-view'];
  
  frontSide: string = '';
  backSide: string = '';
  leftView: string = '';
  rightView: string = '';
  cabView: string = '';

  isEDV: boolean = false;

  editable: boolean = true;
  picturesViewable: boolean = false;

  alertsElement: any;

  van: string | null = '';

  driver: any;
  date: string = '';
  week: string = '';

  compressionOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 4000,
    useWebWorker: true
  }

  constructor(
    private elRef: ElementRef,
    private picturesService: PicturesService,
    private router: Router,
    private renderer: Renderer2
  ) { }

  ngAfterViewInit(): void {
    if(this.van) {
      this.vanNumber.setValue(this.van);
      this.vanNumber.disable();

      for(let type of this.types) {
        let picture = this.picturesService.getPictureFromLocalStorage(type);
        if(picture) {
          this.previewPicture(type, picture);
        }
      }
    }

    this.alertsElement = this.elRef.nativeElement.querySelector('#alerts');
    
  }

  ngOnInit(): void {
    let driver = localStorage.getItem('driver');
    this.van = localStorage.getItem('van');

    if(driver) {
      this.driver = JSON.parse(driver);
    } else {
      this.router.navigate(['/login']);
    }

    this.picturesViewable = this.van ? true : false;
    
    let now: any = new Date();
    this.date = `${now.getMonth() + 1}-${now.getDate()}-${now.getFullYear()}`;

    let initialYear: any = new Date(now.getFullYear(), 0, 1);

    let timelapse = now - initialYear;
    let days = Math.floor(timelapse / 86400000);
    this.week = `week-${Math.floor(days / 7) + 1}`;
    
    this.vanNumber.valueChanges.subscribe(value => {
      if(this.EDVRegex.test(value!)) {
        this.isEDV = true;
        this.picturesViewable = true;
        this.vanNumberError = false;
      } else if(this.GasRegx.test(value!)) {
        this.isEDV = false;
        this.picturesViewable = true;
        this.vanNumberError = false;
      } else {
        this.isEDV = false;
        this.picturesViewable = false;
        this.vanNumberError = true;
      }
    });
  }

  async onFileChange(event: any, type: string) {
    this.vanNumber.disable();
    this.elRef.nativeElement.querySelector('#myRange').value = 0;

    if(!localStorage.getItem('van')) {
      localStorage.setItem('van', this.vanNumber.value!);
    }
    
    const file = await imageCompression(event.target.files[0], this.compressionOptions);

    if (file) {
      let formData = new FormData();
      formData.append('driver-name', `${this.driver.first_name}-${this.driver.last_name}`);
      formData.append('van-type', this.isEDV ? 'EDV' : 'BL');
      formData.append('van-number', this.vanNumber.value!);
      formData.append('type', type);
      formData.append('date', this.date);
      formData.append('year', this.date.split('-')[2]);
      formData.append('week', this.week);
      formData.append('image', file);

      this.picturesService.uploadPicture(formData).subscribe((event: any) => {
        switch (event.type) {
          case HttpEventType.Sent: 
            break;
          case HttpEventType.UploadProgress:
            let max = event.total;
            let value = event.loaded;

            let slider = this.elRef.nativeElement.querySelector('#myRange');

            slider.max = max;

            let progress = value / max;

            slider.value = value;

            if(progress >= 1) {
              let pictureName = `${this.isEDV ? 'EDV' : 'BL'}${this.vanNumber.value!}-${type}-${this.driver.first_name}-${this.driver.last_name}-${this.date}.jpg`;
              let previewURL = `${environment.API_URL}/pictures/preview?key=${pictureName}&?t=${Date.now()}`;
              this.previewPicture(type, previewURL);
            }
            
            break;
          case HttpEventType.Response:
              this.createAlert('Picture Uploaded Successfully!', 'Upload', 'success');
              break;
          default:
            break;
        }
      },
      error => {
        this.handleError(error.status, error.message, 'Upload');
      })
    }
  }

  previewPicture(type: string, data: string) {
    this.picturesService.savePictureToLocalStorage(data, type);
    let side: string = type.split('-')[0];
    side = side.charAt(0).toUpperCase() + side.slice(1);
    this.elRef.nativeElement.querySelector(`#label${side}View`).style.backgroundImage = `url(${data})`;
    this.elRef.nativeElement.querySelector(`#label${side}View`).style.backgroundSize = `cover`;
    this.elRef.nativeElement.querySelector(`#label${side}View`).style.backgroundPosition = `center`;
  }

  reset() {

    let confirmation = confirm('Are you sure you want to reset the pictures?');
    if(!confirmation) {
      return;
    }
    
    this.picturesService.resetPictures(this.types, `${this.isEDV ? 'EDV' : 'BL'}${this.vanNumber.value!}`).subscribe(res => {
      this.resetLocalState();
    },
    error => {
      this.handleError(error.status, error.message, 'Reset');
    });
  }

  savePicturesToCloud() {
    this.picturesService.savePictures(`${this.driver.first_name} ${this.driver.last_name}`, this.driver.id, this.isEDV ? 'EDV' : 'BL', parseInt(this.vanNumber.value!), Date.now()).subscribe(res => {
      this.createAlert('Pictures Saved Successfully!', 'Save', 'success');
      this.resetLocalState();
    },
    error => {
      this.handleError(error.status, error.message, 'Saving');
    });
  }

  resetLocalState() {
    localStorage.removeItem('van');
      for(let type of this.types) {
        this.picturesService.deletePictureFromLocalStorage(type);
      }
      this.vanNumber.setValue('');
      this.vanNumber.enable();
      this.picturesViewable = false;
  }

  exit() {
    this.router.navigate(['/login']);
  }

  handleError(status: number, message: string = '', type: string = 'Error') {
    switch(status) {
      case 400:
        this.createAlert(message ?? 'Bad Request', type, 'error');
        break;
      case 401:
        this.createAlert(message ?? 'Unauthorized', type, 'error');
        break;
      case 403:
        this.createAlert(message ?? 'Forbidden', type, 'error');
        break;
      case 404:
        this.createAlert(message ?? 'Not Found', type, 'error');
        break;
      case 405:
        this.createAlert(message ?? 'Method Not Allowed', type, 'error');
        break;
      case 406:
        this.createAlert(message ?? 'Not Acceptable', type, 'error');
        break;
      case 408:
        this.createAlert(message ?? 'Request Timeout', type, 'error');
        break;
      case 409:
        this.createAlert(message ?? 'Conflict', type, 'error');
        break;
      case 410:
        this.createAlert(message ?? 'Gone', type, 'error');
        break;
      case 422:
        this.createAlert(message ?? 'Unprocessable Entity', type, 'error');
        break;
      case 429:
        this.createAlert(message ?? 'Too Many Requests', type, 'error');
        break;
      case 500:
        this.createAlert(message ?? 'Internal Server Error', type, 'error');
        break;
      case 501: 
        this.createAlert(message ?? 'Not Implemented', type, 'error');
        break;
      case 502:
        this.createAlert(message ?? 'Bad Gateway', type, 'error');
        break;
      case 503:
        this.createAlert(message ?? 'Service Unavailable', type, 'error');
        break;
      case 504:
        this.createAlert(message ?? 'Gateway Timeout', type, 'error');
        break;
      case 505:
        this.createAlert(message ?? 'HTTP Version Not Supported', type, 'error');
        break;
      default:
        this.createAlert(message ?? 'Something went wrong', type, 'error');
        break;
    }
  }

  createAlert(message: string, type: string, status: string) {

    let color = this.getAlertColor(status);
    
    let alert = this.renderer.createElement('div');
    alert.classList.add('alert');
    alert.classList.add('w-full');
    alert.classList.add(`bg-${color}-600`);
    alert.classList.add('text-white');
    alert.classList.add('rounded-lg');
    alert.classList.add('shadow-lg');
    alert.classList.add('p-2');

    let alertContent = this.renderer.createElement('div');
    alertContent.classList.add('alert-content');
    alertContent.classList.add('flex');
    alertContent.classList.add('flex-col');
    alertContent.classList.add('justify-center');
    alertContent.classList.add('items-center');

    let alertTitle = this.renderer.createElement('div');
    alertTitle.classList.add('alert-title');
    alertTitle.classList.add('flex');
    alertTitle.classList.add('flex-row');
    alertTitle.classList.add('justify-center');
    alertTitle.classList.add('items-center');

    let alertTitleText = this.renderer.createElement('span');
    alertTitleText.classList.add('alert-title-text');
    alertTitleText.classList.add('text-xl');
    alertTitleText.classList.add('font-bold');
    alertTitleText.innerText = type;

    alertTitle.appendChild(alertTitleText);

    let alertMessage = this.renderer.createElement('div');
    alertMessage.classList.add('alert-message');
    alertMessage.classList.add('flex');
    alertMessage.classList.add('flex-row');
    alertMessage.classList.add('justify-center');
    alertMessage.classList.add('items-center');

    let alertMessageText = this.renderer.createElement('span');
    alertMessageText.classList.add('alert-message-text');
    alertMessageText.classList.add('text-lg');
    alertMessageText.classList.add('font-bold');
    alertMessageText.innerText = message;

    alertMessage.appendChild(alertMessageText);

    alertContent.appendChild(alertTitle);
    alertContent.appendChild(alertMessage);

    alert.appendChild(alertContent);

    this.elRef.nativeElement.querySelector('#alerts').appendChild(alert);

    setTimeout(() => {
      this.elRef.nativeElement.querySelector('#alerts').removeChild(alert);
    }, 2500)
    
  }

  getAlertColor(type: string) {
    switch(type) {
      case 'success':
        return 'green';
      case 'error':
        return 'red';
      case 'warning':
        return 'yellow';
      default:
        return 'blue';
    }
  }
}
