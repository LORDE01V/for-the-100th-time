import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { Impact } from './impact';

describe('Impact', () => {
  let fixture: ComponentFixture<Impact>;
  let component: Impact;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Impact, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(Impact);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set rating', () => {
    component.setRating(3);
    expect(component.rating).toBe(3);
  });
});
