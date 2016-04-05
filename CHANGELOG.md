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



