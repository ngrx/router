# @ngrx/router
Angular 2 Reactive Routing.

@ngrx/router exposes an API with multiple middleware entry points, easy to load, asynchronous route configuration, and powerful route resolution hooks. A fresh, Rx-based alternative for your [Angular 2](https://angular.io/) routing needs.


### Installation
Install @ngrx/router into your Angular 2 project via npm.

```
npm install @ngrx/router --save
```

### Routing Setup

1. Configure your application routes.

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
  ]
  ```
2. Setup application components

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
3. Register router in application bootstrap.

  ```ts
  import { provideRouter } from '@ngrx/router';

  bootstrap(App, [
    provideRouter(routes)
  ]);
  ```

That's it! You are ready to begin taking advantage of reactive routing!

### Documentation

* [Route Configuration](route.md)
* [Route Links](links.md)
* [Index Routes](index-route.md)
* [Redirects](redirect.md)
* [Code Splitting](code-splitting.md)
* [Route Parameters](route-params.md)
* [Guarding Routes](guards.md)
