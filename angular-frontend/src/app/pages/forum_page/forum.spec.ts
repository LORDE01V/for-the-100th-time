import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Forum } from './forum';

describe('Forum', () => {
  let component: Forum;
  let fixture: ComponentFixture<Forum>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [Forum]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Forum);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select a topic', () => {
    const topic = component.dummyTopics[0];
    component.selectTopic(topic);
    expect(component.selectedTopic).toBe(topic);
  });

  it('should post a message', () => {
    const topic = component.dummyTopics[0];
    component.selectTopic(topic);
    component.newMessage = 'Test message';
    component.postMessage();
    expect(component.replies[topic.id].length).toBe(1);
    expect(component.replies[topic.id][0].message).toBe('Test message');
  });

  it('should summarize discussion', async () => {
    const topic = component.dummyTopics[0];
    component.selectTopic(topic);
    await component.summarizeDiscussion();
    expect(component.summary).toContain('Summary of the message');
  });

  it('should check tone', async () => {
    component.newMessage = 'This is a good day!';
    await component.checkTone();
    expect(component.tone).toBe('positive');
  });
});