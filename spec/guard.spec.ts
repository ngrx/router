import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';
import { ReflectiveInjector } from '@angular/core';

import { Route } from '../lib/route';
import { TraversalCandidate } from '../lib/route-traverser';
import { Guard, provideGuard, GuardHook } from '../lib/guard';


describe('Guard Middleware', function() {
  let guardHook: GuardHook;
  let injector: ReflectiveInjector;

  function route(route: Route, params = {}, isTerminal = false) {
    return Observable.of({ route, params, isTerminal });
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
    const guard = provideGuard(() => () => Observable.of(true));

    route({ guards: [ guard ] }).let(t => guardHook.apply(t)).subscribe();

    expect(injector.resolveAndInstantiate).toHaveBeenCalledWith(guard);
  });

  it('should provide guards with the route it has matched', function() {
    const testGuard = { run: () => Observable.of(true) };
    spyOn(testGuard, 'run').and.callThrough();
    const guard = provideGuard(() => testGuard.run);
    const nextRoute = { guards: [ guard ] };
    const params = { abc: 123 };
    const isTerminal = true;

    route(nextRoute, params, isTerminal).let(t => guardHook.apply(t)).subscribe();

    expect(testGuard.run).toHaveBeenCalledWith(params, nextRoute, isTerminal);
  });

  it('should return true if all of the guards return true', function(done) {
    const pass = provideGuard(() => () => Observable.of(true));

    route({ guards: [ pass ] })
      .let<TraversalCandidate>(t => guardHook.apply(t))
      .subscribe(({ route }) => {
        expect(route).toBeTruthy();

        done();
      });
  });

  it('should return false if just one guard returns false', function(done) {
    const pass = provideGuard(() => () => Observable.of(true));
    const fail = provideGuard(() => () => Observable.of(false));

    route({ guards: [ pass, fail ] })
      .let<any>(t => guardHook.apply(t))
      .subscribe(({ route }) => {
        expect(route).toBeFalsy();

        done();
      });
  });
});
