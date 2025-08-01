import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Faultdetails } from './faultdetails';

describe('Faultdetails', () => {
  let component: Faultdetails;
  let fixture: ComponentFixture<Faultdetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Faultdetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Faultdetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});