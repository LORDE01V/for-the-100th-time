import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { TopupPage } from './topup-page';

describe('TopupPage', () => {
  let component: TopupPage;
  let fixture: ComponentFixture<TopupPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopupPage, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
