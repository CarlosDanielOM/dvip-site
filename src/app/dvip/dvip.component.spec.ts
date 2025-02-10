import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DvipComponent } from './dvip.component';

describe('DvipComponent', () => {
  let component: DvipComponent;
  let fixture: ComponentFixture<DvipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DvipComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DvipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
