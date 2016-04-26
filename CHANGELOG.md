<a name="0.3.0"></a>
# [0.3.0](https://github.com/ngrx/router/compare/v0.2.4...v0.3.0) (2016-04-26)


### Bug Fixes

* **LinkActive:** Fix active link for base url when using hash (#74) ([12961d4](https://github.com/ngrx/router/commit/12961d4)), closes [(#74](https://github.com/(/issues/74)
* **RouterInstruction:** Pass the subscriber back through NgZone (#70) ([894b088](https://github.com/ngrx/router/commit/894b088))
* **RouteView:** Add route view directive export (#75) ([dc38682](https://github.com/ngrx/router/commit/dc38682))

### Code Refactoring

* **Guards:** Improve guards API based on common usage (#62) ([1ea2806](https://github.com/ngrx/router/commit/1ea2806))

### Features

* **LinkActive:** Added default class when link is active (#72) ([e6a2920](https://github.com/ngrx/router/commit/e6a2920)), closes [#71](https://github.com/ngrx/router/issues/71)
* **RouteInterface:** Add options key to route interface used to store arbitrary metadata (#69) ([900822e](https://github.com/ngrx/router/commit/900822e)), closes [#68](https://github.com/ngrx/router/issues/68)


### BREAKING CHANGES

* Guards:   Before:
  ```ts
  const auth = createGuard(function(http: Http) {

    return function(route: Route, params: any, isTerminal: boolean) {
      return http.get(...);
    };

  }, [ Http ]);
  ```

  After:
  ```ts
  const auth = provideGuard(function(http: Http) {

    return function(params: any, route: Route, isTerminal: boolean) {
      return http.get(...);
    };

  }, [ Http ]);
  ```



<a name="0.2.4"></a>
## [0.2.4](https://github.com/ngrx/router/compare/v0.2.2...v0.2.4) (2016-04-22)


### Bug Fixes

* **linkTo:** Remove trailing slashes from the linkTo path (#59) ([c048a51](https://github.com/ngrx/router/commit/c048a51))
* **RouterInstruction:** Switched to async scheduler because zone.js (#61) ([da6f725](https://github.com/ngrx/router/commit/da6f725))
* **UndefinedRoutes:** Route view correctly ignores undefined routes (#60) ([1cdb67a](https://github.com/ngrx/router/commit/1cdb67a))



<a name="0.2.2"></a>
## [0.2.2](https://github.com/ngrx/router/compare/v0.2.1...v0.2.2) (2016-04-14)


### Bug Fixes

* **guards:** Redirect in a guard on page load correctly causes location update ([b99e6fa](https://github.com/ngrx/router/commit/b99e6fa))



<a name="0.2.1"></a>
## [0.2.1](https://github.com/ngrx/router/compare/v0.2.0...v0.2.1) (2016-04-14)




<a name="0.2.0"></a>
# [0.2.0](https://github.com/ngrx/router/compare/v0.1.1...v0.2.0) (2016-04-14)


### Code Refactoring

* **core:** Updated core API for naming consistency (#53) ([d879a90](https://github.com/ngrx/router/commit/d879a90))
* **location:** Renamed Location service to Router (#56) ([5b14ef9](https://github.com/ngrx/router/commit/5b14ef9))

### Features

* **NamedComponents:** Add ability to configure named components ([df895cf](https://github.com/ngrx/router/commit/df895cf)), closes [#6](https://github.com/ngrx/router/issues/6)
* **patternMatching:** Switch to path-to-regexp for pattern matching (#57) ([4176112](https://github.com/ngrx/router/commit/4176112))


### BREAKING CHANGES

* location: Renamed `Location` service to `Router` and renamed `replaceState` method to `replace`

Before:
```ts
import { Location } from '@ngrx/router';

class App {
    constructor(location: Location) {
        location.replaceState('/path', { query: 1 });
    }
}
```

After:
```ts
import { Router } from '@ngrx/router';

class App {
    constructor(router: Router) {
        router.replace('/path', { query: 1 });
    }
}
```
* core: Renamed `NextRoute` interface and `RouteSet` service to `NextInstruction` and `RouterInstruction` respectively.

  Before:
  ```ts
  import { NextRoute, RouteSet } from '@ngrx/router';
  ```

  After:
  ```ts
  import { NextInstruction, RouterInstruction } from '@ngrx/router';
  ```
* core: Changed `NextInstruction` interface to include full `LocationChange` instead of just the path. Renamed `routes` to `routeConfigs`, `params` to `routeParams`, and `query` to `queryParams`

  Before:
  ```ts
  interface NextRoute {
    routes: Routes;
    query: any;
    params: any;
    url: string
  }
  ```

  After:
  ```ts
  interface NextInstruction {
    routeConfigs: Routes;
    queryParams: any;
    routeParams: any;
    locationChange: LocationChange;
  }
  ```



<a name="0.1.1"></a>
## [0.1.1](https://github.com/ngrx/router/compare/v0.0.7...v0.1.1) (2016-04-06)


### Bug Fixes

* **Providers:** Include ResourceLoader providers ([a12fa6b](https://github.com/ngrx/router/commit/a12fa6b))

### Features

* **AsyncConfig:** Refactor route config to use promises instead of callbacks ([f057d55](https://github.com/ngrx/router/commit/f057d55))
* **Params:** Simplify params services by removing select method ([af160d7](https://github.com/ngrx/router/commit/af160d7))


### BREAKING CHANGES

* AsyncConfig: Before loadComponent, loadChildren, and loadIndexRoute used a callback to handle async loading

  of code. These must be replaced with promise-returning functions.



  Before:



  ```ts

  {

    loadIndex(done) {

      System.import('./my-index-route', __moduleName)

        .then(module => done(module.indexRoute));

    },

    loadComponent(done) {

      System.import('./my-component', __moduleName)

        .then(module => done(module.MyComponent));

    },

    loadChildren(done) {

      System.import('./child-routes', __moduleName)

        .then(module => done(module.routes));

    }

  }

  ```



  After:



  ```

  {

    loadIndex: () => System.import('./my-index-route', __moduleName)

      .then(module => module.indexRoute),



    loadComponent: () => System.import('./my-component', __moduleName)

      .then(module => module.MyComponent),



    loadChildren: () => System.import('./child-routes', __moduleName)

      .then(module => module.routes)

  }

  ```
* Params: select method removed from QueryParams and RouteParams. Use pluck instead:

  BEFORE:

  ```ts

  routeParams.select('id').subscribe(id => {});

  ```

  AFTER:

  ```ts

  routeParams.pluck('id').subscribe(id => {});

  ```



<a name="0.0.7"></a>
## [0.0.7](https://github.com/ngrx/router/compare/v0.0.6...v0.0.7) (2016-04-04)


### Bug Fixes

* **Loader:** Use promises to wrap callbacks because zones :( ([ccb44b5](https://github.com/ngrx/router/commit/ccb44b5))



<a name="0.0.6"></a>
## [0.0.6](https://github.com/ngrx/router/compare/v0.0.5...v0.0.6) (2016-04-04)




<a name="0.0.5"></a>
## [0.0.5](https://github.com/ngrx/router/compare/v0.0.4...v0.0.5) (2016-04-04)


### Bug Fixes

* **Guards:** Passing guards no longer remove terminal status ([14d0d46](https://github.com/ngrx/router/commit/14d0d46))



<a name="0.0.4"></a>
## [0.0.4](https://github.com/ngrx/router/compare/v0.0.3...v0.0.4) (2016-04-04)


### Bug Fixes

* **MatchRoute:** Give favor to the order in which routes are defined ([f37a394](https://github.com/ngrx/router/commit/f37a394))



<a name="0.0.3"></a>
## [0.0.3](https://github.com/ngrx/router/compare/v0.0.2...v0.0.3) (2016-04-04)


### Bug Fixes

* **Guard:** Updated guard to use new traversal middleware API ([a5bc802](https://github.com/ngrx/router/commit/a5bc802))
* **Guards:** Schedule guard results to allow for guards to cancel traversal ([4792acc](https://github.com/ngrx/router/commit/4792acc))
* **LinkActive:** Added linkActive directive to platform directives ([63f3831](https://github.com/ngrx/router/commit/63f3831))
* **LinkTo:** Updated spec to use MockLocationStrategy ([e6017cc](https://github.com/ngrx/router/commit/e6017cc))
* **MatchRoute:** Correct spelling mistake on route traversal error ([984fbf2](https://github.com/ngrx/router/commit/984fbf2))
* **MatchRoute:** Don't import unnecessary every operator ([3222169](https://github.com/ngrx/router/commit/3222169))
* **MatchRoute:** Export TraversalCandidate as part of public API ([0ecf695](https://github.com/ngrx/router/commit/0ecf695))

### Features

* **directives:** Added linkActive directive ([7750329](https://github.com/ngrx/router/commit/7750329))
* **MatchRoute:** Moved traversal middleware opportunity to after a route is matched ([5144caa](https://github.com/ngrx/router/commit/5144caa))



<a name="0.0.2"></a>
## [0.0.2](https://github.com/ngrx/router/compare/v0.0.1...v0.0.2) (2016-04-01)




<a name="0.0.1"></a>
## [0.0.1](https://github.com/ngrx/router/compare/c899754...v0.0.1) (2016-04-01)


### Bug Fixes

* **build:** Copy LICENSE to release ([582c43f](https://github.com/ngrx/router/commit/582c43f))
* **Gaurds:** Handle empty guard arrays ([68100a2](https://github.com/ngrx/router/commit/68100a2))
* **Guards:** Use merge/every instead of forkJoin ([c899754](https://github.com/ngrx/router/commit/c899754))
* **Guide:** Fix formatting on guide index ([0ad086b](https://github.com/ngrx/router/commit/0ad086b))
* **Location:** Cleaned up Location service ([1d0ab8a](https://github.com/ngrx/router/commit/1d0ab8a))
* **MatchRoute:** updated RouteTraverser to inject routes ([09feccc](https://github.com/ngrx/router/commit/09feccc))
* **MatchRoute:** Updated unit tests to match new API ([687eda8](https://github.com/ngrx/router/commit/687eda8))
* **sourcemaps:** Render the sourcemaps inline so they can be published easily ([6ff5a95](https://github.com/ngrx/router/commit/6ff5a95))
* **test:** Added sourcemaps to karma ([9f11ea5](https://github.com/ngrx/router/commit/9f11ea5))
* **testing:** Updated webpack config for tests ([00efe4c](https://github.com/ngrx/router/commit/00efe4c))
* **tests:** Include tests in tsconfig.json ([29aaf26](https://github.com/ngrx/router/commit/29aaf26))

### Features

* **build:** Added initial build setup ([1ef9199](https://github.com/ngrx/router/commit/1ef9199)), closes [#1](https://github.com/ngrx/router/issues/1)
* **ComponentRenderer:** Added unit tests for component renderer service ([10c31cc](https://github.com/ngrx/router/commit/10c31cc))
* **ComponentRenderer:** Split render middleware into pre/post render middleware ([59b7ad9](https://github.com/ngrx/router/commit/59b7ad9))
* **directives:** Added linkTo directive ([7703ba2](https://github.com/ngrx/router/commit/7703ba2))
* **Guards:** Added unit tests for guard middleware ([0364168](https://github.com/ngrx/router/commit/0364168))
* **LinkTo:** Added unit tests for LinkTo directive ([529879f](https://github.com/ngrx/router/commit/529879f))
* **Location:** Added unit tests for location service ([09ba1e6](https://github.com/ngrx/router/commit/09ba1e6))
* **Location:** Updated location to be a ReplaySubject instead of BehaviorSubject ([41dc49b](https://github.com/ngrx/router/commit/41dc49b))
* **Middleware:** Added small test for middleware helpers ([0689555](https://github.com/ngrx/router/commit/0689555))
* **QueryParams:** Added new QueryParams service ([075845b](https://github.com/ngrx/router/commit/075845b))
* **Redirect:** Added tests for redirection middleware ([0c526ee](https://github.com/ngrx/router/commit/0c526ee))
* **RouteParams:** Added unit tests for RouteParams service ([4074a40](https://github.com/ngrx/router/commit/4074a40))
* **RouteSet:** Added unit tests for route set ([f7421bc](https://github.com/ngrx/router/commit/f7421bc))
* **RouteSet:** Refactored route set to expose query params ([0f9c40d](https://github.com/ngrx/router/commit/0f9c40d))
* **RouteView:** Added unit tests for route view ([09700ee](https://github.com/ngrx/router/commit/09700ee))
* **test:** Added initial setup for testing ([aba3689](https://github.com/ngrx/router/commit/aba3689)), closes [#2](https://github.com/ngrx/router/issues/2)
* **Util:** Added unit tests for utilities ([58b627c](https://github.com/ngrx/router/commit/58b627c))



