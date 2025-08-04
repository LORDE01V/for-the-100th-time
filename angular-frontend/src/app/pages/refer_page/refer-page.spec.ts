import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferPage } from './refer-page';

describe('ReferPage', () => {
  let component: ReferPage;
  let fixture: ComponentFixture<ReferPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReferPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReferPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
