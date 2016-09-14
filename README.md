# @ngrx/router

**This project is DEPRECATED**

The [Angular 2 Router](https://angular.io/docs/ts/latest/guide/router.html) was inspired by the ngrx/router, shares a familiar API and will be updated going forward. The ngrx/router may continue to live on as a framework agnostic router with more experimental features.

[Migration Guide to Angular Router](./docs/overview/migration.md)

### Reactive Router for Angular 2
[![npm version](https://badge.fury.io/js/%40ngrx%2Frouter.svg)](https://badge.fury.io/js/%40ngrx%2Frouter)

This is an alternative router for Angular 2 focused on providing a simple, reactive API built to scale for large applications.

Please note that we are currently in _beta_. We believe the core of the router is solid and we do not expect anymore breaking changes to the API.

### Installation
Install @ngrx/router and @ngrx/core into your Angular 2 project via npm:

```
npm install @ngrx/router @ngrx/core --save
```

### Routing Setup

1. Create your application components:

  ```ts
  import { Component } from '@angular/core';

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

* [Location Strategy](./docs/overview/location-strategy.md)
* [Route Configuration](./docs/overview/route.md)
* [Route Links](./docs/overview/links.md)
* [Router Navigation](./docs/overview/navigation.md)
* [Redirects](./docs/overview/redirect.md)
* [Code Splitting](./docs/overview/code-splitting.md)
* [Route and Query Parameters](./docs/overview/params.md)
* [Guarding Routes](./docs/overview/guards.md)
* [SystemJS Configuration](./docs/overview/systemjs.md)
* [Webpack Configuration](./docs/overview/webpack.md)
* [Angular CLI Configuration](./docs/overview/angular-cli.md)
