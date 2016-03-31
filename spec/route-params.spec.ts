import { Subject } from 'rxjs/Subject';
import { Injector, provide } from 'angular2/core';
import { NextRoute, RouteSet } from '../lib/route-set';
import { RouteParams, ROUTE_PARAMS_PROVIDERS } from '../lib/route-params';


describe('RouteParams Service', function() {
  let routeSet$: Subject<NextRoute>;
  let params$: RouteParams;

  beforeEach(function() {
    routeSet$ = new Subject<NextRoute>();
    const injector = Injector.resolveAndCreate([
      ROUTE_PARAMS_PROVIDERS,
      provide(RouteSet, { useValue: routeSet$ })
    ]);

    params$ = injector.get(RouteParams);
  });

  afterEach(function() {
    routeSet$.complete();
  });

  it('should project params from the current route', function(done) {
    const params = { id: 123 };

    params$.subscribe(value => {
      expect(value).toBe(params);

      done();
    });

    routeSet$.next({ routes: [], params, url: '' });
  });

  it('should let you select a single param to observe', function(done) {
    const params = { id: 123 };

    params$.select('id').subscribe(id => {
      expect(id).toBe(params.id);

      done();
    });

    routeSet$.next({ params, routes: [], url: '' });
  });

  it('should replay the previous param value when you subscribe', function(done) {
    const params = { id: 456 };
    routeSet$.next({ params, routes: [], url: '' });

    params$.subscribe(value => {
      expect(value).toBe(params);

      done();
    });
  })
});
