import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LandingPage } from './landing-page';

describe('LandingPage', () => {
  let component: LandingPage;
  let fixture: ComponentFixture<LandingPage>;
  let router: Router;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    
    await TestBed.configureTestingModule({
      declarations: [LandingPage],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingPage);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should rotate greetings', () => {
    const initial = component.currentGreetingIndex;
    component.ngOnInit();
    component.currentGreetingIndex = (initial + 1) % component.greetings.length;
    expect(component.currentGreetingIndex).not.toBe(initial);
  });

  it('should rotate feature messages', () => {
    const initial = component.currentMessageIndex;
    component.ngOnInit();
    component.currentMessageIndex = (initial + 1) % component.messages.length;
    expect(component.currentMessageIndex).not.toBe(initial);
  });

  it('should have correct number of features', () => {
    expect(component.features.length).toBe(3);
  });

  it('should have correct number of developers', () => {
    expect(component.developers.length).toBe(5);
  });

  it('should navigate to register page', () => {
    component.navigateToRegister();
    expect(router.navigate).toHaveBeenCalledWith(['/register']);
  });

  it('should clean up intervals on destroy', () => {
    spyOn(window, 'clearInterval');
    component.ngOnDestroy();
    expect(window.clearInterval).toHaveBeenCalled();
  });
});