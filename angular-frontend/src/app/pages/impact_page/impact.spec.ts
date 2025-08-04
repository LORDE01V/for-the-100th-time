import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Impact } from './impact';

describe('Impact', () => {
  let component: Impact;
  let fixture: ComponentFixture<Impact>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [Impact]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Impact);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add a testimonial', () => {
    component.name = 'Test User';
    component.email = 'test@example.com';
    component.quote = 'Great!';
    component.rating = 5;
    const initial = component.testimonials.length;
    component.submitTestimonial();
    expect(component.testimonials.length).toBe(initial + 1);
  });

  it('should cycle testimonials', () => {
    const initial = component.currentTestimonial;
    component.nextTestimonial();
    expect(component.currentTestimonial).toBe((initial + 1) % component.testimonials.length);
    component.prevTestimonial();
    expect(component.currentTestimonial).toBe(initial);
  });
});