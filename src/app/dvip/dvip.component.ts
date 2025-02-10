import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { PicturesService } from '../pictures.service';

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

  frontSide: string = '';
  backSide: string = '';
  leftView: string = '';
  rightView: string = '';
  cabView: string = '';

  isEDV: boolean = false;

  isUploading: boolean = false;
  isUploaded: boolean = false;
  isError: boolean = false;
  errorMessage: string = '';
  uploadMessage: string = '';
  uploadPercentage: number = 0;
  uploadSpeed: number = 0;
  uploadTimeRemaining: number = 0;
  uploadTimeElapsed: number = 0;
  uploadTotalSize: number = 0;
  uploadCurrentSize: number = 0;

  editable: boolean = true;

  constructor(
    private elRef: ElementRef,
    private picturesService: PicturesService
  ) { }

  ngOnInit(): void {
    this.vanNumber.valueChanges.subscribe(value => {
      if(this.EDVRegex.test(value!)) {
        this.isEDV = true;
        this.vanNumberError = false;
      } else if(this.GasRegx.test(value!)) {
        this.isEDV = false;
        this.vanNumberError = false;
      } else {
        this.isEDV = false;
        this.vanNumberError = true;
      }
    });
  }

  onFileChange(event: any, type: string) {
    this.vanNumber.disable();
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.previewPicture(type, reader.result as string);
      }
    }
  }

  previewPicture(type: string, data: string) {
    let side: string = type.split('-')[0];
    side = side.charAt(0).toUpperCase() + side.slice(1);
    this.elRef.nativeElement.querySelector(`#label${side}View`).style.backgroundImage = `url(${data})`;
    this.elRef.nativeElement.querySelector(`#label${side}View`).style.backgroundSize = `cover`;
    this.elRef.nativeElement.querySelector(`#label${side}View`).style.backgroundPosition = `center`;
  }
}