import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

interface Post {
  id: number;
  author: string;
  content: string;
  timestamp: Date;
  likes: number;
  replies: Post[];
}

@Component({
  selector: 'app-forum-page',
  templateUrl: './forum-page.component.html',
  styleUrls: ['./forum-page.component.scss']
})
export class ForumPageComponent {
  newPostContent = new FormControl('', [Validators.required, Validators.minLength(10)]);
  posts: Post[] = [
    {
      id: 1,
      author: 'EnergyExpert23',
      content: 'Has anyone tried the new solar panel optimization techniques?',
      timestamp: new Date('2024-03-15'),
      likes: 12,
      replies: [
        {
          id: 2,
          author: 'SolarUser99',
          content: 'Yes! Saw a 15% efficiency boost with the new angle adjustments',
          timestamp: new Date('2024-03-16'),
          likes: 5,
          replies: []
        }
      ]
    }
  ];

  submitPost() {
    if (this.newPostContent.valid) {
      this.posts.unshift({
        id: Date.now(),
        author: 'CurrentUser',
        content: this.newPostContent.value || '',
        timestamp: new Date(),
        likes: 0,
        replies: []
      });
      this.newPostContent.reset();
    }
  }

  likePost(post: Post) {
    post.likes++;
  }

  toggleReply(post: Post) {
    // Implement reply functionality here
  }
}
