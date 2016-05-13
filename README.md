# @ngrx/router
### Reactive Router for Angular 2
[![Join the chat at https://gitter.im/ngrx/store](https://badges.gitter.im/ngrx/store.svg)](https://gitter.im/ngrx/store?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![npm version](https://badge.fury.io/js/%40ngrx%2Frouter.svg)](https://badge.fury.io/js/%40ngrx%2Frouter)
[![Build Status](https://codeship.com/projects/68a711c0-df45-0133-c764-764018ced76c/status?branch=master)](https://codeship.com/projects/144986)

This is an alternative router for Angular 2 focused on providing a simple, reactive API built to scale for large applications.

Please note that we are currently pre-v1.0. While we believe the core of the router is solid, you can expect a few breaking changes as we work towards a beta release. These early releases are meant to gather feedback from the community and to help with the direction of the router.

### Installation
Install @ngrx/router and @ngrx/core into your Angular 2 project via npm:

```
npm install @ngrx/router @ngrx/core --save
```

### Routing Setup

1. Create your application components:

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
        <a *ngFor="let post of posts" [linkTo]="'/blog/' + post.id">{{ post.title }}</a>
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
2. Configure your application routes:

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

3. Register router in application bootstrap.

  ```ts
  import { provideRouter } from '@ngrx/router';

  bootstrap(App, [
    provideRouter(routes)
  ]);
  ```

That's it! You are ready to begin taking advantage of reactive routing!

### Documentation

* [Route Configuration](./docs/overview/route.md)
* [Route Links](./docs/overview/links.md)
* [Redirects](./docs/overview/redirect.md)
* [Code Splitting](./docs/overview/code-splitting.md)
* [Route and Query Parameters](./docs/overview/params.md)
* [Guarding Routes](./docs/overview/guards.md)
