import { Subject } from 'rxjs/Subject';
import { Injector, provide } from 'angular2/core';
import { NextRoute, RouteSet } from '../lib/route-set';
import { RouteParams, QueryParams, PARAMS_PROVIDERS } from '../lib/params';


describe('Params Services', function() {
  let routeSet$: Subject<NextRoute>;
  let routeParams$: RouteParams;
  let queryParams$: QueryParams;

  beforeEach(function() {
    routeSet$ = new Subject<NextRoute>();
    const injector = Injector.resolveAndCreate([
      PARAMS_PROVIDERS,
      provide(RouteSet, { useValue: routeSet$ })
    ]);

    routeParams$ = injector.get(RouteParams);
    queryParams$ = injector.get(QueryParams);
  });

  afterEach(function() {
    routeSet$.complete();
  });

  describe('RouteParams', function() {
    it('should project route params from the current route set', function(done) {
      const params = { id: 123 };

      routeParams$.subscribe(value => {
        expect(value).toBe(params);

        done();
      });

      routeSet$.next({ routes: [], params, url: '', query: {} });
    });
  });

  describe('QueryParams', function() {
    it('should project query params from the current route set', function(done) {
      const query = { search: 'abcd' };

      queryParams$.subscribe(value => {
        expect(value).toBe(query);

        done();
      });

      routeSet$.next({ routes: [], params: {}, url: '', query });
    });
  });
});
