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
]
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
