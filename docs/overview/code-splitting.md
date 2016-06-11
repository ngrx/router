# Code Splitting with Asynchronous Routes

ngrx/router was designed from the ground up to make it easy to load route configuration asynchronously.

Lets take the route configuration from the previous example and using Webpack's `require.ensure` asynchronously load our routes and components:

In `routes.ts`:
```ts
import { Routes } from '@ngrx/router';

export const routes: Routes = [
  {
    path: '/',
    loadComponent: () => new Promise(resolve => {
      require.ensure([], require => {
        resolve(require('./pages/home').HomePage);
      })
    })
  },
  {
    path: '/blog',
    loadComponent: () => new Promise(resolve => {
      require.ensure([], require => {
        resolve(require('./pages/blog').BlogPage);
      })
    }),
    loadChildren: () => new Promise(resolve => {
      require.ensure([], require => {
        resolve(require('./blog-routes').blogRoutes);
      })
    })
  }
];
```

In `blog-routes.ts`:
```ts
import { Routes } from '@ngrx/router';

export const blogRoutes: Routes = [
  {
    path: ':id',
    loadComponent: () => new Promise(resolve => {
      require.ensure([], require => {
        resolve(require('./pages/post').PostPage);
      });
    })
  }
];
```

If you're using SystemJs instead of webPack use System.import, to lazy load child routes using the following

In routes.ts
```
import { Routes } from '@ngrx/router';
export const routes: Routes = [
 {
    path: '/',
    component: HomePageComponent
  },
  { path: '/blog', 
    loadComponent: ()=> System.import('src/blog-main')
        .then(module => module.BlogMainComponent),
    index:{ 
        loadComponent: ()=> System.import('src/blog-index')
        .then(module => module.BlogIndexComponent),
    },
    children:[
        { 
          path: '/post',
          loadComponent: ()=> System.import('src/blog-post')
            .then(module => module.BlogPostComponent)
        }
      ]
  }
```

Now our router will load route configuration and components as needed. This can have a dramatic impact on the amount of code your users will need to download up front in order to run your application.

## Named Routes
Just like you can use `components` instead of `component` to specify a map of named components, you can do the same with `loadComponents`:

```ts
export const routes: Routes = [
  {
    path: '/blog',
    loadComponents: {
      main: () => System.import('/app/blog.ts')
        .then(module => module.BlogPage),
      sideMenu: () => System.import('/app/recent-posts.ts')
        .then(module => module.RecentPosts)
    }
  }
];
```


