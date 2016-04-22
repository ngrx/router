import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';
import { Injector } from 'angular2/core';

import { Route } from '../lib/route';
import { Middleware } from '../lib/middleware';
import { TraversalCandidate } from '../lib/route-traverser';
import { Guard, provideGuard, guardMiddleware } from '../lib/guard';


describe('Guard Middleware', function() {
  let guardRunner: Middleware;
  let injector: Injector;

  function route(route: Route, params = {}, isTerminal = false) {
    return Observable.of({ route, params, isTerminal });
  }

  beforeEach(function() {
    injector = Injector.resolveAndCreate([]);
    guardRunner = injector.resolveAndInstantiate(guardMiddleware);
  });

  it('should always return true for routes with no gaurds', function(done) {
    route({ })
      .let<TraversalCandidate>(guardRunner)
      .subscribe(({ route }) => {
        expect(route).toBeTruthy();

        done();
      });
  });

  it('should return true for routes with an empty guard array', function(done) {
    route({ guards: [] })
      .let<TraversalCandidate>(guardRunner)
      .subscribe(({ route }) => {
        expect(route).toBeTruthy();

        done();
      });
  });

  it('should resolve all guards in the context of the injector', function() {
    spyOn(injector, 'resolveAndInstantiate').and.callThrough();
    const guard = provideGuard(() => () => Observable.of(true));

    route({ guards: [ guard ] }).let(guardRunner).subscribe();

    expect(injector.resolveAndInstantiate).toHaveBeenCalledWith(guard);
  });

  it('should provide guards with the route it has matched', function() {
    const testGuard = { run: () => Observable.of(true) };
    spyOn(testGuard, 'run').and.callThrough();
    const guard = provideGuard(() => testGuard.run);
    const nextRoute = { guards: [ guard ] };
    const params = { abc: 123 };
    const isTerminal = true;

    route(nextRoute, params, isTerminal).let(guardRunner).subscribe();

    expect(testGuard.run).toHaveBeenCalledWith(params, nextRoute, isTerminal);
  });

  it('should return true if all of the guards return true', function(done) {
    const pass = provideGuard(() => () => Observable.of(true));

    route({ guards: [ pass ] })
      .let<TraversalCandidate>(guardRunner)
      .subscribe(({ route }) => {
        expect(route).toBeTruthy();

        done();
      });
  });

  it('should return false if just one guard returns false', function(done) {
    const pass = provideGuard(() => () => Observable.of(true));
    const fail = provideGuard(() => () => Observable.of(false));

    route({ guards: [ pass, fail ] })
      .let(guardRunner)
      .subscribe(({ route }) => {
        expect(route).toBeFalsy();

        done();
      });
  });
});
