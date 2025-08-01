import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingPageComponent } from './landing-page';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

describe('LandingPageComponent', () => {
  let component: LandingPageComponent;
  let fixture: ComponentFixture<LandingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPageComponent, RouterTestingModule.withRoutes([])], // Import standalone component and RouterTestingModule
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Initial change detection
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display "Welcome to GridX"', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.hero-heading')?.textContent).toContain('Welcome to GridX');
  });

  it('should navigate to /register on "Get Started" button click', () => {
    const navigateSpy = spyOn(component['router'], 'navigate'); // Access private router property
    const button = fixture.debugElement.query(By.css('.btn-primary')).nativeElement;
    button.click();
    expect(navigateSpy).toHaveBeenCalledWith(['/register']);
  });

  it('should display rotating greetings', (done) => {
    // Ensure the greeting is updated after some time
    setTimeout(() => {
      fixture.detectChanges();
      const greetingText = fixture.nativeElement.querySelector('.greeting-text').textContent;
      // Expect the greeting to be one of the defined greetings
      expect(component.southAfricanGreetings).toContain(greetingText);
      done();
    }, 3500); // A bit more than the 3000ms interval to ensure update
  });

  it('should display developer names', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.developer-name').length).toBe(component.developers.length);
    expect(compiled.querySelector('.developer-name')?.textContent).toContain('Kgothatso Mokgashi');
  });

  // Add more tests as needed for features, typing animation, etc.
});
