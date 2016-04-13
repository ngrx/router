# Route Configuration

Route configuration is a set of rules the Router uses when trying to match the URL to a set of components.


To demonstrate, lets write a couple of components for a simple bog web app:

```ts
import { Component } from 'angular2/core';

@Component({
  selector: 'app',
  template: `
    <h1>My Blog</h1>
    <nav>
      <a linkTo="/">Home</a>
      <a linkTo="/blog">Blog</a>
    </nav>

    <route-view></route-view>
  `
})
class App { }

@Component({
  selector: 'home-page',
  template: `
    <h2>Home Page</h2>
  `
})
class HomePage { }

@Component({
  selector: 'blog-page',
  template: `
    <h2>Blog</h2>
    <nav>
      <a *ngFor="var post of posts" [linkTo]="'/blog/' + post.id">{{ post.title }}</a>
    </nav>

    <route-view></route-view>
  `
})
class BlogPage { }

@Component({
  selector: 'post-page',
  template: `
    <h3>Post</h3>
  `
})
class PostPage { }
```

Now we need to write route configuration with the following rules:

* When `/`, show the `HomePage` component
* When `/blog`, show the `BlogPage` component
* when `/blog/:id`, show the `BlogPage` and `PostPage` components

```ts
import { Routes } from '@ngrx/router';

const routes: Routes = [
  {
    path: '/',
    component: HomePage
  },
  {
    path: '/blog',
    component: BlogPage,
    children: [
      {
        path: ':id',
        component: PostPage
      }
    ]
  }
];
```

To get this working, all we have to do is provide the router with the route configuration when we bootstrap the application:

```ts
import { provideRouter } from '@ngrx/router';

bootstrap(App, [
  provideRouter(routes)
]);
```

## Named Components
For composing more complex views, the `<route-view>` component can be instructed to use named components. In our route config, instead of supplying `component` we can supply `components`:

```ts
const routes: Routes = [
  {
    path: '/blog',
    components: {
      main: Blog,
      sideMenu: RecentPosts
    }
  }
]
```

Then in our `App` template we give each `<route-view />` a name:

```ts
@Component({
  selector: 'app',
  template: `
    <section>
      <route-view name="main"></route-view>
    </section>

    <aside>
      <route-view name="sideMenu"></route-view>
    </aside>
  `
})
export class App { }
```

# Index Routes
Imagine if you wanted to show a list of posts when the user is just on `/blog`. When the user is on `/blog/:id`, don't show the list of posts and instead just show a single post. This can be accomplished using _Index Routes_.

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

## Pathless Routes
Sometimes you want to share a common component and/or guards with a group of routes. To achieve this with @ngrx/router, you can write a _pathless_ route. Pathless routes have all of the features of a regular route except they do not define a path, preventing them from being routed to directly.

Expanding on our blog example, lets change `/blog/:id` to `/posts/:id` but still preserve the same component tree:

```ts
import { Routes } from '@ngrx/router';

const routes: Routes = [
  {
    component: BlogPage,
    children: [
      {
        path: '/blog',
        component: BlogPostsPage
      },
      {
        path: '/posts/:id',
        component: PostPage
      }
    ]
  }
];
```

## Pattern Matching
Pattern matching in @ngrx/router is built on top of [path-to-regexp](https://github.com/pillarjs/path-to-regexp), a popular pattern matching library used by a large number of popular router projects like Express and Koa. For more information on what patterns @ngrx/router supports, checkout the [path-to-regexp documentation](https://github.com/pillarjs/path-to-regexp/blob/master/Readme.md#parameters). To play with pattern matching, use the [Express Route Tester](http://forbeslindesay.github.io/express-route-tester/?_ga=1.61903652.927460731.1460569779)
