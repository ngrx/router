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

    route({ guards: [ PassGuard ] }).let(t => guardHook.apply(t)).subscribe();

    expect(injector.resolveAndInstantiate).toHaveBeenCalledWith(PassGuard);
  });

  // Intentionally commenting this out because a future PR will refactor
  // traversal candidate and will pass that to the guards instead
  xit('should provide guards with the TraversalCandidate', function() {
    // const testGuard = { run: () => Observable.of(true) };
    // spyOn(testGuard, 'run').and.callThrough();
    // const guard = provideGuard(() => testGuard.run);
    // const nextRoute = { guards: [ guard ] };
    // const params = { abc: 123 };
    // const isTerminal = true;
    //
    // route(nextRoute, params, isTerminal).let(t => guardHook.apply(t)).subscribe();
    //
    // expect(testGuard.run).toHaveBeenCalledWith(params, nextRoute, isTerminal);
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
