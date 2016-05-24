# Guards
Guards are powerful hooks into the Router's route resolution process. When the location in the browser changes, a route traversal process begins. This process evaluates each route in your route configuration performing the following tasks:

* Is the path a partial match?
  * No: Stop evaluating the route
  * Yes: Is the path a full match?
    * Yes: Load the index route
    * No: Load the children routes and repeat process for all children

Guards are run after the router determines it is a partial match but before it evaluates it. This gives you the opportunity let the router's traversal process know if a route should continue to be considered a candidate route.

### Use Cases
A great use case for guards is auth protecting routes. Guards are services with a `protectRoute` method that return an Observable of true or false. If your guard's observable emits true, then traversal continues. If your guard emits false, traversal is canceled immediately and the router moves on to the next candidate route. Note that guards will not finish running until your observable completes. To write an auth guard we'll need to use the `provideGuard` helper:

```ts
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Guard, Route, TraversalCandidate, LocationChange } from '@ngrx/router';

@Injectable()
class AuthGuard implements Guard {
  constructor(private _http: Http) { }

  protectRoute(candidate: TraversalCandidate) {    
    // `route` is the current route being evaluated
    const route: Route = candidate.route;

    // `locationChange` includes the full path and type of change that caused traversal
    const locationChange: LocationChange = candidate.locationChange;

    // `queryParams` are the parsed query parameters
    const queryParams: any = candidate.queryParams;

    // `routeParams` is a snapshot of the route parameters discovered so far
    const routeParams: any = candidate.routeParams;

    // `isTerminal` indicates that the candidate route is going to be the last route traversed
    const isTerminal: boolean = candidate.isTerminal;

    return this._http.get('/auth/check')
      // If request succeeds, return true
      .map(() => true)
      // If request fails, return false
      .catch(() => Observable.of(false));
  }
}
```

To use this guard first we have to add it to the route's guards:

```ts
const routes: Routes = [
  {
    path: '/account',
    guards: [ AuthGuard ],
    loadComponent: () => System.import('app/pages/account')
      .then(module => module.AccountPage),
    loadChildren: () => System.import('app/routes/account')
      .then(module => module.accountRoutes),
  }
]
```

Then we include it in the providers array with the router:

```ts
bootstrap(App, [
  provideRouter(routes),
  AuthGuard
]);
```

### What Makes Guards Powerful?
Guards are run before the component or children are loaded. This prevents the user from having to load unnecessary code giving you a big win in performance.

While a guard must always return an observable, if a guard dispatches a route change (for instance redirecting to a `400 Not Authorized` route) the current traversal will be immediately canceled:

```ts
@Injectable()
class AuthGuard implements Guard {
  constructor(private _http: Http, private _router: Router) { }

  protectRoute(candidate: TraversalCandidate) {
    return this._http.get('/auth/check')
      .map(() => true)
      // If request fails, catch the error and redirect
      .catch(() => {
        this._router.go('/400');

        return Observable.of(false);
      });
  }
}
```

### Router Services
Some router services like `RouterInstruction`, `RouteParams`, and `QueryParams` do not get updated until after all guards have been run. For this reason your guards should generally not use these services and instead should get route and query params out of the traversal candidate object provided to the `protectRoute` method.
