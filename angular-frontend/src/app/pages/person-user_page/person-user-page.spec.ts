import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PersonUserPage } from './person-user-page';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('PersonUserPage', () => {
  let component: PersonUserPage;
  let fixture: ComponentFixture<PersonUserPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonUserPage, ReactiveFormsModule, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonUserPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});