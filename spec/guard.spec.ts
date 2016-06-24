import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';
import { ReflectiveInjector } from '@angular/core';

import { Route } from '../lib/route';
import { TraversalCandidate } from '../lib/route-traverser';
import { Guard, GuardHook } from '../lib/guard';


describe('Guard Middleware', function() {
  let guardHook: GuardHook;
  let injector: ReflectiveInjector;

  class PassGuard implements Guard {
    protectRoute = () => Observable.of(true);
  }

  class FailGuard implements Guard {
    protectRoute = () => Observable.of(false);
  }

  function route(
    route: Route,
    routeParams = {},
    queryParams = {},
    isTerminal = false,
    locationChange = { type: 'push', path: '/' }
  ): Observable<TraversalCandidate> {
    return Observable.of(<TraversalCandidate>{ route, routeParams, queryParams, isTerminal, locationChange });
  }

  beforeEach(function() {
    injector = ReflectiveInjector.resolveAndCreate([]);
    guardHook = injector.resolveAndInstantiate(GuardHook);
  });

  it('should always return true for routes with no gaurds', function(done) {
    route({ })
      .let<TraversalCandidate>(t => guardHook.apply(t))
      .subscribe(({ route }) => {
        expect(route).toBeTruthy();

        done();
      });
  });

  it('should return true for routes with an empty guard array', function(done) {
    route({ guards: [] })
      .let<TraversalCandidate>(t => guardHook.apply(t))
      .subscribe(({ route }) => {
        expect(route).toBeTruthy();

        done();
      });
  });

  it('should resolve all guards in the context of the injector', function() {
    spyOn(injector, 'resolveAndInstantiate').and.callThrough();

    route({ guards: [ PassGuard ] }).let(t => guardHook.apply(t)).subscribe();

    expect(injector.resolveAndInstantiate).toHaveBeenCalledWith(PassGuard);
  });


  it('should provide guards with the TraversalCandidate', function() {
    const spy = jasmine.createSpy('protectRoute').and.returnValue(Observable.of(true));
    class MockGuard {
      protectRoute = spy;
    }

    const traversalCandidate: TraversalCandidate = {
      route: { path: '/', guards: [ MockGuard ] },
      queryParams: {},
      routeParams: {},
      locationChange: { type: 'push', path: '/' },
      isTerminal: true
    };

    const stream$ = Observable.of(traversalCandidate);

    stream$.let(t => guardHook.apply(t)).subscribe();

    expect(spy).toHaveBeenCalledWith(traversalCandidate);
  });

  it('should return true if all of the guards return true', function(done) {
    route({ guards: [ PassGuard ] })
      .let<TraversalCandidate>(t => guardHook.apply(t))
      .subscribe(({ route }) => {
        expect(route).toBeTruthy();

        done();
      });
  });

  it('should return false if just one guard returns false', function(done) {
    route({ guards: [ PassGuard, FailGuard ] })
      .let<any>(t => guardHook.apply(t))
      .subscribe(({ route }) => {
        expect(route).toBeFalsy();

        done();
      });
  });
});
