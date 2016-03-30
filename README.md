# @ngrx/router
### Extremely Experimental!
This is a reactive router for Angular 2. It started as a fork of [react-router](https://github.com/reactjs/react-router) and shares a similar philosophy towards routing. It exposes an Rx-based API with multiple middleware entry points.

Do not use it yet! We are still missing testing infrastructure, there is little to no documentation, and the API is very likely to change _a lot_ over the coming weeks. These early releases are meant to gather feedback on the direction of the router.


### General Setup
_Note:_ This router has not been published to npm yet

Write your route config:
```ts
import { Routes } from '@ngrx/router';

export const routes: Routes = [
  {
    path: '/',
    component: Home
  },
  {
    path: '/blog',
    component: Blog,
    indexRoute: {
      component: Articles
    },
    children: [
      {
        path: ':id',
        component: Post
      }
    ]
  },
  {
    path: '/posts/:id',
    redirectTo: '/blog/:id'
  },
  {
    path: '/**',
    component: NotFound
  }
];
```

Provide the router:
```ts
import { provideRouter } from '@ngrx/router';

bootstrap(App, [
  provideRouter(routes)
])
```

Include the `<route-view>` component somewhere:
```ts
@Component({
  selector: 'app',
  template: `
    <route-view></route-view>
  `
})
class App { }
```
