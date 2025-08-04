import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Groupbuying } from './groupbuying';

describe('Groupbuying', () => {
  let component: Groupbuying;
  let fixture: ComponentFixture<Groupbuying>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [Groupbuying]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Groupbuying);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add a new campaign', () => {
    component.newCampaign = {
      product: 'Test Product',
      description: 'Test Desc',
      originalPrice: 1000,
      groupPrice: 800,
      targetBuyers: 5,
      deadline: '2024-12-31',
      image: 'test.png',
      category: 'Solar Panels'
    };
    component.selectedImage = 'test.png';
    component.createCampaign();
    expect(component.ongoingCampaigns.some(c => c.product === 'Test Product')).toBeTrue();
  });

  it('should join a campaign', () => {
    const campaign = component.ongoingCampaigns[0];
    const initial = campaign.participants;
    component.joinCampaign(campaign);
    expect(campaign.participants).toBe(initial + 1);
  });

  it('should rotate motivational lines', () => {
    const initial = component.currentLineIndex;
    component.ngOnInit();
    component.currentLineIndex = initial;
    component['intervalId'] && clearInterval(component['intervalId']);
    component.currentLineIndex = (initial + 1) % component.motivationalLines.length;
    expect(component.currentLineIndex).not.toBe(initial);
  });
});