import { ReflectiveInjector, provide } from 'angular2/core';

import { RESOURCE_LOADER_PROVIDERS } from '../lib/resource-loader';
import { Routes, Route, ROUTES } from '../lib/route';
import { RouteTraverser, MATCH_ROUTE_PROVIDERS } from '../lib/route-traverser';


describe('RouteTraverser', function() {
  let traverser: RouteTraverser;

  let RootRoute: Route;
  let UsersRoute: Route;
  let UsersIndexRoute: Route;
  let UserRoute: Route;
  let PostRoute: Route;
  let FilesRoute: Route;
  let AboutRoute: Route;
  let TeamRoute: Route;
  let ProfileRoute: Route;
  let GreedyRoute: Route;
  let OptionalRoute: Route;
  let OptionalRouteChild: Route;
  let CatchAllRoute: Route;
  let RegexRoute: Route;
  let UnnamedParamsRoute: Route;
  let UnnamedParamsRouteChild: Route;
  let PathlessRoute: Route;
  let PathlessChildRoute: Route;

  let routes: Routes = [
    RootRoute = {
      children: [
        UsersRoute = {
          path: 'users',
          indexRoute: (UsersIndexRoute = {}),
          children: [
            UserRoute = {
              path: ':userID',
              children: [
                ProfileRoute = {
                  path: '/profile'
                },
                PostRoute = {
                  path: ':postID'
                }
              ]
            },
            TeamRoute = {
              path: '/team'
            }
          ]
        }
      ]
    },
    FilesRoute = {
      path: '/files/*/*.jpg'
    },
    AboutRoute = {
      path: '/about'
    },
    GreedyRoute = {
      path: '/*/f'
    },
    OptionalRoute = {
      path: '/(optional)?',
      children: [
        OptionalRouteChild = {
          path: 'child'
        }
      ]
    },
    RegexRoute = {
      path: '/int/:int(\\d+)'
    },
    UnnamedParamsRoute = {
      path: '/unnamed-params/(foo)',
      children: [
        UnnamedParamsRouteChild = {
          path: '(bar)'
        }
      ]
    },
    PathlessRoute = {
      children: [
        PathlessChildRoute = {
          path: 'pathless-child'
        }
      ]
    },
    CatchAllRoute = {
      path: '*'
    }
  ];

  beforeEach(function() {
    const injector = ReflectiveInjector.resolveAndCreate([
      MATCH_ROUTE_PROVIDERS,
      RESOURCE_LOADER_PROVIDERS,
      provide(ROUTES, { useValue: routes })
    ]);
    traverser = injector.get(RouteTraverser);
  });

  function describeRoutes() {
    describe('when the location matches an index route', function() {
      it('matches the correct routes', function(done) {
        traverser
          .find('/users')
          .subscribe(match => {
            expect(match).toBeDefined();
            expect(match.routes).toEqual([ RootRoute, UsersRoute, UsersIndexRoute ]);

            done();
          });
      });
    });

    describe('when the location matches a nested route with params', function() {
      it('matches the correct routes and params', function(done) {
        traverser
          .find('/users/5')
          .subscribe(match => {
            expect(match).toBeDefined();
            expect(match.routes).toEqual([ RootRoute, UsersRoute, UserRoute ]);
            expect(match.params).toEqual({ userID: '5' });

            done();
          });
      });
    });

    describe('when the location matches a deeply nested route with params', function() {
      it('matches the correct routes and params', function(done) {
        traverser
          .find('/users/5/abc')
          .subscribe(match => {
            expect(match).toBeDefined();
            expect(match.routes).toEqual([ RootRoute, UsersRoute, UserRoute, PostRoute ]);
            expect(match.params).toEqual({ userID: '5', postID: 'abc' });

            done();
          });
      });
    });

    describe('when the location matches a nested route with multiple splat params', function() {
      it('matches the correct routes and params', function(done) {
        traverser
          .find('/files/a/b/c.jpg')
          .subscribe(match => {
            expect(match).toBeDefined();
            expect(match.routes).toEqual([ FilesRoute ]);
            expect(match.params).toEqual({ 0: 'a/b', 1: 'c' });

            done();
          });
      });
    });

    describe('when the location matches a nested route with a greedy splat param', function() {
      it('matches the correct routes and params', function(done) {
        traverser
          .find('/foo/bar/f')
          .subscribe(match => {
            expect(match).toBeDefined();
            expect(match.routes).toEqual([ GreedyRoute ]);
            expect(match.params).toEqual({ 0: 'foo/bar' });

            done();
          });
      });
    });

    describe('when the location matches an absolute route', function() {
      it('matches the correct routes', function(done) {
        traverser
          .find('/about')
          .subscribe(match => {
            expect(match).toBeDefined();
            expect(match.routes).toEqual([ AboutRoute ]);

            done();
          });
      });
    });

    describe('when the location matches an optional route', function() {
      it('matches the the optional pattern is missing', function(done) {
        traverser
          .find('/')
          .subscribe(match => {
            expect(match).toBeDefined();
            expect(match.routes).toEqual([ OptionalRoute ]);

            done();
          });
      });

      it('matches the the optional pattern is present', function(done) {
        traverser
          .find('/optional')
          .subscribe(match => {
            expect(match).toBeDefined();
            expect(match.routes).toEqual([ OptionalRoute ]);

            done();
          });
      });
    });

    describe('when the location matches the child of an optional route', function() {
      it('matches when the optional pattern is missing', function(done) {
        traverser
          .find('/child')
          .subscribe(match => {
            expect(match).toBeDefined();
            expect(match.routes).toEqual([ OptionalRoute, OptionalRouteChild ]);

            done();
          });
      });

      it('matches when the optional pattern is present', function(done) {
        traverser
          .find('/optional/child')
          .subscribe(match => {
            expect(match).toBeDefined();
            expect(match.routes).toEqual([ OptionalRoute, OptionalRouteChild ]);

            done();
          });
      });
    });

    describe('when the location does not match any routes', function() {
      it('matches the "catch-all" route', function(done) {
        traverser
          .find('/not-found')
          .subscribe(match => {
            expect(match).toBeDefined();
            expect(match.routes).toEqual([ CatchAllRoute ]);

            done();
          });
      });

      it('matches the "catch-all" route on a deep miss', function(done) {
        traverser
          .find('/not-found/foo')
          .subscribe(match => {
            expect(match).toBeDefined();
            expect(match.routes).toEqual([ CatchAllRoute ]);

            done();
          });
      });

      it('matches the "catch-all" route on missing path separators', function(done) {
        traverser
          .find('/optionalchild')
          .subscribe(match => {
            expect(match).toBeDefined();
            expect(match.routes).toEqual([ CatchAllRoute ]);

            done();
          });
      });

      it('matches the "catch-all" route on a regex miss', function(done) {
        traverser
          .find('/int/foo')
          .subscribe(match => {
            expect(match).toBeDefined();
            expect(match.routes).toEqual([ CatchAllRoute ]);

            done();
          });
      });
    });

    describe('when the location matches a route with param regex', function() {
      it('matches the correct routes and param', function(done) {
        traverser
          .find('/int/42')
          .subscribe(match => {
            expect(match).toBeDefined();
            expect(match.routes).toEqual([ RegexRoute ]);
            expect(match.params).toEqual({ int: '42' });

            done();
          });
      });
    });

    describe('when the location matches a nested route with an unnamed param', function() {
      it('matches the correct routes and params', function(done) {
        traverser
          .find('/unnamed-params/foo/bar')
          .subscribe(match => {
            expect(match).toBeDefined();
            expect(match.routes).toEqual([ UnnamedParamsRoute, UnnamedParamsRouteChild ]);
            expect(match.params).toEqual({ 0: 'foo', 1: 'bar' });

            done();
          });
      });
    });

    describe('when the location matches pathless routes', function() {
      it('matches the correct routes', function(done) {
        traverser
          .find('/pathless-child')
          .subscribe(match => {
            expect(match).toBeDefined();
            expect(match.routes).toEqual([
              PathlessRoute,
              PathlessChildRoute
            ]);

            done();
          });
      });
    });
  }

  describe('synchronous route config', function() {
    describeRoutes();

    xdescribe('when the location matches a nested absolute route', function() {
      it('matches the correct routes', function(done) {
        traverser
          .find('/team')
          .subscribe(match => {
            expect(match).toBeDefined();
            expect(match.routes).toEqual([ RootRoute, UsersRoute, TeamRoute ]);

            done();
          });
      });
    });
  });

  describe('asynchronous route config', function() {
    function makeAsyncRouteConfig(routes: Routes) {
      routes.forEach(route => {
        const { children, indexRoute } = route;

        if ( children ) {
          delete route.children;

          route.loadChildren = () => Promise.resolve(children);

          makeAsyncRouteConfig(children);
        }

        if ( indexRoute ) {
          delete route.indexRoute;

          route.loadIndexRoute = () => Promise.resolve(indexRoute);
        }
      });
    }

    beforeEach(function() {
      makeAsyncRouteConfig(routes);
    });

    describeRoutes();
  });

});
