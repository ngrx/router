# Guards
Guards are powerful hooks into the Router's route resolution process. When the location in the browser changes, a route traversal process begins. This process evaluates each route in your route configuration performing the following tasks:

* Is the path a partial match?
  * No: Stop evaluating the route
  * Yes: Is the path a full match?
    * Yes: Load the index route
    * No: Load the children routes and repeat process for all children

Guards are run before a route is selected to be evaluated. This gives you the opportunity let the router's traversal process know if a route should be considered a candidate or not for traversal.

### Use Cases
A great use case for guards is auth protecting routes. Guards are functions that return an Observable of true or false. If your guard's observable emits true, then traversal continues. If your guard emits false, traversal is canceled immediately and the router moves on to the next candidate route. To write an auth guard, we'll need to use the `createGuard` helper:

```ts
import 'rxjs/add/observable/of';
import { Http } from 'angular2/http';
import { Observable } from 'rxjs/Observable';
import { createGuard, Route } from '@ngrx/router';

const authGuard = createGuard(function(http: Http) {
  // Guards are provided with the route that is being evaluated, a snapshot
  // of the route params that have been parsed so far, and whether or not
  // the matched route is the final match
  return function(route: Route, params: any, terminal: boolean) {
    return http.get('/auth/check')
      // If request succeeds, return true
      .map(() => true)
      // If request fails, return false
      .catch(() => Observable.of(false));
  }
}, [ Http ]);
```

To use this guard, all we have to do is add it to the route's guards:

```ts
const routes: Routes = [
  {
    path: '/account',
    guards: [ authGuard ],
    loadComponent: () => System.import('/pages/account', __moduleName)
      .then(module => module.AccountPage),
    loadChildren: () => System.import('/routes/account', __moduleName))
      .then(module => module.accountRoutes),
  }
]
```

### What Makes Guards Powerful?
Guards are run before the component or children are loaded. This prevents the user from having to load unnecessary code, giving you a big win in performance.

While a guard must always return an observable, if a guard dispatches a route change (for instance redirecting to a `400 Not Authorized` route) the current traversal will be immediately canceled:

```ts
const authGuard = createGuard(function(http: Http, router: Router) {
  // Guards are provided with the route that is being evaluated:
  return function(route: Route) {
    return http.get('/auth/check')
      // If request succeeds, return true
      .map(() => true)
      // If request fails, redirect to "not authorized" route
      .catch(() => {
        router.replace('/not-authorized');
        return Observable.of(false);
      });
  }
}, [ Http ]);
```

### Injection
Guards are limited by the services they can inject. They are run in the context of the root injector, meaning if there is a service you want to inject into a guard you must provide that service in the same injector (or a parent of the injector) where you provide the router. Additionally, some router services like `RouteSet`, `RouteParams`, and `QueryParams` do not get updated until after all guards have been run.
