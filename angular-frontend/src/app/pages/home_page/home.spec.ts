import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Home } from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [Home]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should rotate tips', () => {
    const initial = component.currentTipIndex;
    component.ngOnInit();
    component.currentTipIndex = (initial + 1) % component.solarTips.length;
    expect(component.currentTipIndex).not.toBe(initial);
  });

  it('should set greeting', () => {
    component.setGreeting();
    setTimeout(() => {
      expect(component.aiGreeting).toContain('Good');
    }, 900);
  });

  it('should handle logout', () => {
    spyOn(window.location, 'href', 'set');
    component.handleLogout();
    expect(window.location.href).toBe('/login');
  });
});