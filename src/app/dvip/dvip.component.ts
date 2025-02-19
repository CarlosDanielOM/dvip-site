import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject } from '@angular/core';
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
  
  vanNumber = new FormControl({value: '0', disabled: false}, [Validators.required]);
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
    private router: Router
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
    
    // const file = await imageCompression(event.target.files[0], this.compressionOptions);
    const file = event.target.files[0];

    console.log({original: (event.target.files[0].size / 1024 / 1024).toFixed(2), compressed: (file.size / 1024 / 1024).toFixed(2)});
    
    if (file) {
      let formData = new FormData();
      formData.append('driver-name', `${this.driver.firstName}-${this.driver.lastName}`);
      formData.append('van-type', this.isEDV ? 'EDV' : 'BL');
      formData.append('van-number', this.vanNumber.value!);
      formData.append('type', type);
      formData.append('date', this.date);
      formData.append('year', this.date.split('-')[2]);
      formData.append('week', this.week);
      formData.append('image', file);

      this.picturesService.uploadPicture(formData).subscribe((event: any) => {
        console.log(event.type)
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

            // if(progress >= 1) {
            //   let previewURL = `${environment.API_URL}/pictures?key=${event.body.previewName}&?t=${Date.now()}`;
            //   //this.previewPicture(type, previewURL);
            // }
            
            break;
          case HttpEventType.Response:
              let previewURL = `${environment.API_URL}/pictures?key=${event.body.previewName}&?t=${Date.now()}`;
              this.previewPicture(type, previewURL);
              break;
          default:
            break;
        }
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
    this.picturesService.resetPictures(this.types, `${this.isEDV ? 'EDV' : 'BL'}${this.vanNumber.value!}`).subscribe(res => {
      console.log(res);
      this.resetLocalState();
    });
  }

  savePicturesToCloud() {
    this.picturesService.savePictures(this.types, `${this.isEDV ? 'EDV' : 'BL'}${this.vanNumber.value!}`).subscribe(res => {
      console.log(res);
      this.resetLocalState();
    });
  }

  resetLocalState() {
    localStorage.removeItem('van');
      for(let type of this.types) {
        this.picturesService.deletePictureFromLocalStorage(type);
      }
      this.vanNumber.setValue('0');
      this.vanNumber.enable();
      this.picturesViewable = false;
  }
}
