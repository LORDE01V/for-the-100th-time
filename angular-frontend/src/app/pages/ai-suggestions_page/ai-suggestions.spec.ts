import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiSuggestions } from './ai-suggestions';

describe('AiSuggestions', () => {
  let component: AiSuggestions;
  let fixture: ComponentFixture<AiSuggestions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiSuggestions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiSuggestions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});