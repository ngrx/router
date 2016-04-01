import { Subject } from 'rxjs/Subject';
import { Injector, provide } from 'angular2/core';

import { Location } from '../lib/location';
import { NextRoute, RouteSet } from '../lib/route-set';
import { QueryParams, QUERY_PARAMS_PROVIDERS } from '../lib/query-params';


describe('QueryParams Service', function() {
  let routeSet$: Subject<NextRoute>;
  let params$: QueryParams;
  let mockLocation: any;

  function update(query) {
    routeSet$.next({ query, routes: [], params: {}, url: '' });
  }

  beforeEach(function() {
    routeSet$ = new Subject<NextRoute>();
    mockLocation = {
      path: () => '/test',
      replaceState(){ }
    };

    spyOn(mockLocation, 'replaceState');

    const injector = Injector.resolveAndCreate([
      QUERY_PARAMS_PROVIDERS,
      provide(RouteSet, { useValue: routeSet$ }),
      provide(Location, { useValue: mockLocation })
    ]);

    params$ = injector.get(QueryParams);
  });

  afterEach(function() {
    routeSet$.complete();
  });

  it('should project query params from the current route', function(done) {
    const query = { id: 123 };

    params$.subscribe(value => {
      expect(value).toBe(query);

      done();
    });

    update(query);
  });

  it('should let you select a single query param to observe', function(done) {
    const query = { id: 123 };

    params$.select('id').subscribe(id => {
      expect(id).toBe(query.id);

      done();
    });

    update(query);
  });

  it('should replay the previous query params value when you subscribe', function(done) {
    const query = { id: 456 };
    update(query);

    params$.subscribe(value => {
      expect(value).toBe(query);

      done();
    });
  });

  it('should replace the query string', function() {
    const next = { test: 123 };
    params$.replace(next);

    expect(mockLocation.replaceState).toHaveBeenCalledWith('/test', next);
  });

  it('should replace the query string with an empty value', function() {
    params$.replace();

    expect(mockLocation.replaceState).toHaveBeenCalledWith('/test', {});
  })
});
