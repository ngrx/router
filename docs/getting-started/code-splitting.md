# Code Splitting with Asynchronous Routes

ngrx/router was designed from the ground up to make it easy to load route configuration asynchronously.

Lets take the route configuration from the previous example and using Webpack's `require.ensure` asynchronously load our routes and components:

In `routes.ts`:
```ts
import { Routes } from 'ngrx/router';

export const routes: Routes = [
  {
    path: '/',
    loadComponent(done) {
      require.ensure([], require => {
        done(require('./pages/home').HomePage);
      })
    }
  },
  {
    path: '/blog',
    loadComponent(done) {
      require.ensure([], require => {
        done(require('./pages/blog').BlogPage);
      })
    },
    loadChildren(done) {
      require.ensure([], require => {
        done(require('./blog-routes').blogRoutes);
      })
    }
  }
]
```

In `blog-routes.ts`:
```ts
import { Routes } from 'ngrx/router';

export const blogRoutes: Routes = [
  {
    path: ':id',
    loadComponent(done) {
      require.ensure([], require => {
        done(require('./pages/post').PostPage);
      });
    }
  }
]
```

Now our router will load route configuration and components as needed. This can have a dramatic impact on the amount of code your users will need to download up front in order to run your application.
