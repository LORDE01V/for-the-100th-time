import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadsheddingPage } from './loadshedding-page';

describe('LoadsheddingPage', () => {
  let component: LoadsheddingPage;
  let fixture: ComponentFixture<LoadsheddingPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadsheddingPage]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoadsheddingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});