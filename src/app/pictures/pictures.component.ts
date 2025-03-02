import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { PicturesService } from '../pictures.service';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-pictures',
  imports: [NavbarComponent, CommonModule],
  templateUrl: './pictures.component.html',
  styleUrl: './pictures.component.css'
})
export class PicturesComponent {
  private pathSubject = new BehaviorSubject<string[]>([]);
  private path$ = this.pathSubject.asObservable();
  private S3Path = `https://${environment.S3_BUCKET}.${environment.S3_URL}/`;
  
  picturesObj: any = {}

  pictures: Observable<any[]> = of([]);

  directories: Observable<string[]> = of([]);
  pathCount = 0;

  constructor(
    private picturesService: PicturesService
  ) {}

  ngOnInit() {
    let pictures = JSON.parse(sessionStorage.getItem('pictures')!);
    if(pictures) {
      this.pictures = of(pictures);
    } else {
      this.pictures = this.picturesService.getEntirePictures();
    }

    this.pictures.subscribe(picture => {
      sessionStorage.setItem('pictures', JSON.stringify(picture));
      pictures = picture;
      this.startDirectory(pictures);
  
      let beggingDirectories = Object.keys(this.picturesObj);
      this.directories = of(beggingDirectories);
    });


    this.path$.subscribe(paths => {
      this.pathCount = paths.length;
      let current: any = this.picturesObj;
      if(paths.length <= 0) {
        current = Object.keys(current);
        this.directories = of(current);
        return;
      }
      for(let path of paths) {
        current = current[path];
      }

      if(this.pathCount >= 4) {
        let image = [];
        let i = 0;
        for(let path in current) {
          console.log(current[path][i]);
          if(!current[path][i]) {
            console.log(current, "help");
          }
          image.push(`${this.S3Path}${paths.join('/')}/${current[path][i]}`);
          i++;
        }
        this.directories = of(image);
        return
      }
      
      this.directories = of(Object.keys(current));
    });
    
  }

  ngAfterViewInit() {
    
  }

  refreshPicturesRenewal() {
    this.picturesService.getEntirePictures().subscribe(pictures => {
      sessionStorage.setItem('pictures', JSON.stringify(pictures));
      this.startDirectory(pictures);
      let again = this.pathSubject.value.pop();
      // Wait for the directory to be created
      this.pathSubject.next([]);
    });
  }

  startDirectory(paths: string[]) {
    this.picturesObj = {};
    let dirParts = this.createAllDirectories(paths);
    let index = 0;
    for(let i = 0; i < dirParts.length; i++) {
      if(index >= 4) index = 0;
      let dirs = dirParts[i];
      let imagePath = dirs.pop();
      dirs.push(index);
      index++;
      this.picturesObj = this.createNestedDirectoryObject(this.picturesObj, dirs, imagePath);
    }
  }

  createNestedDirectoryObject(obj: any, keys: string[], value: any) {
    let current = obj;
    for(let i = 0; i < keys.length; i++) {
      if(!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    return obj;
  }

  moveInDirectory(path: string) {
    this.pathSubject.next([...this.pathSubject.value, path]);
  }

  moveOutDirectory() {
    this.pathSubject.next([...this.pathSubject.value.slice(0, -1)]);
  }

  createAllDirectories(paths: string[]) {
    let tree: any[] = [];
    for(let i = 0; i < paths.length; i++) {
      tree.push(paths[i].split('https://burst.hel1.your-objectstorage.com/')[1].split('/'));
    }
    return tree;
  }

  createDirectoryTree(path: string) {
    let tree: string[] = [];
    let parts = path.split('/');
    for(let i = 0; i < parts.length; i++) {
      tree.push(parts.slice(0, i + 1).join('/'));
    }
    return tree;
  }
  
}
