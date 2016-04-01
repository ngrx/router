# Guards
Guards are powerful hooks into the Router's route resolution process. When the location in the browser changes, a route traversal process begins. This process evaluates each route in your route configuration performing the following tasks:

* Is the path a partial match?
  * No: Stop evaluating the route
  * Yes: Is the path a full match?
    * Yes: Load the index route
    * No: Load the children routes and repeat process for all children

Guards are run before a route is selected to be evaluated. This gives you the opportunity let the router's traversal process know if a route should be considered a candidate or not for traversal.

A great use case for guards is auth protecting routes. Guards are functions that return an Observable of true or false. If your guard's observable emits true, then traversal continues. If your guard emits false, traversal is canceled immediately and the router moves on to the next candidate route. To write an auth guard, we'll need to use the `createGuard` helper:

```ts
import 'rxjs/add/observable/of';
import { Http } from 'angular2/http';
import { Observable } from 'rxjs/Observable';
import { createGuard, Route } from '@ngrx/router';

const authGuard = createGuard(function(http: Http) {
  // Guards are provided with the route that is being evaluated:
  return function(route: Route) {
    return http.get('/auth/check')
      // If request succeeds, return true
      .map(() => true)
      // If request fails, return false
      .catch(() => Observable.of(false));
  }
}, [ Http ]);
```

To use this guard, all we have to do is specify it in a route's guard list:

```ts
const routes: Routes = [
  {
    path: '/account',
    guards: [ authGuard ],
    loadComponent(done) {
      System.load('/pages/account')
        .then(module => done(module.AccountPage));
    },
    loadChildren(done) {
      System.load('/routes/account')
        .then(module => done(module.accountRoutes));
    }
  }
]
```

What makes guards powerful is that they run before the component or children are loaded. This prevents the user from having to load unnecessary code, giving you a big win in performance.

While a guard must always return an observable, if a guard dispatches a route change (for instance redirecting to a `400 Not Authorized` route) the current traversal will be immediately canceled.

With great power comes major limitations that you need to be aware of. First, guards are run in the context of the root injector. This means that if guards require services like `Http`, they need to provided when you bootstrap your application. Second, because they are run before the router finishes resolving a new URL you do not have access to route params or query params yet.
