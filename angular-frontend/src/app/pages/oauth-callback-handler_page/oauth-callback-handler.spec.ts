import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OAuthCallbackHandler } from './oauth-callback-handler';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('OAuthCallbackHandler', () => {
  let component: OAuthCallbackHandler;
  let fixture: ComponentFixture<OAuthCallbackHandler>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OAuthCallbackHandler, HttpClientTestingModule, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OAuthCallbackHandler);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});