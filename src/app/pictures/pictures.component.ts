import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { PicturesService } from '../pictures.service';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-pictures',
  imports: [NavbarComponent, CommonModule],
  templateUrl: './pictures.component.html',
  styleUrl: './pictures.component.css'
})
export class PicturesComponent {

  pictures: Observable<any[]> = of([]);

  constructor(
    private picturesService: PicturesService
  ) {}

  ngOnInit() {
    this.pictures = this.picturesService.getEntirePictures();
  }
  
}
