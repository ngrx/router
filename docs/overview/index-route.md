# Index Routes

Continuing from the example in the [Route](route.md) guide, imagine if you wanted to show a list of posts when the user is just on `/blog`. When the user is on `/blog/:id`, don't show the list of posts and instead just show a single post. This can be accomplished using _Index Routes_.

First we need to write a new `BlogPostsPage` component:

```ts
import { Component } from 'angular2/core';

@Component({
  selector: 'blog-posts-page',
  template: `
    <h3>All Posts</h3>
  `
})
class BlogPostsPage { }
```

Now we just need to rewrite the `/blog` route configuration to specify an index route:

```ts
const routes: Routes = [
  {
    path: '/blog',
    component: BlogPage
    indexRoute: {
      component: BlogPostsPage
    },
    children: [
      {
        path: ':id',
        component: PostPage
      }
    ]
  }
]
```
