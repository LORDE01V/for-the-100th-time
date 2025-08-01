import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrivacyPolicyPage } from './privacy-policy-page';
import { Location } from '@angular/common';

describe('PrivacyPolicyPage', () => {
  let component: PrivacyPolicyPage;
  let fixture: ComponentFixture<PrivacyPolicyPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyPolicyPage],
      providers: [Location]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivacyPolicyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});