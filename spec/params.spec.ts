import { Subject } from 'rxjs/Subject';
import { Injector, provide } from 'angular2/core';
import { NextInstruction, RouterInstruction } from '../lib/router-instruction';
import { RouteParams, QueryParams, PARAMS_PROVIDERS } from '../lib/params';


describe('Params Services', function() {
  let routerInstruction$: Subject<NextInstruction>;
  let routeParams$: RouteParams;
  let queryParams$: QueryParams;

  function nextInstruction(routeParams, queryParams) {
    routerInstruction$.next({
      routeConfigs: [],
      routeParams,
      queryParams,
      locationChange: {
        type: 'push',
        path: ''
      }
    });
  }

  beforeEach(function() {
    routerInstruction$ = new Subject<NextInstruction>();
    const injector = Injector.resolveAndCreate([
      PARAMS_PROVIDERS,
      provide(RouterInstruction, { useValue: routerInstruction$ })
    ]);

    routeParams$ = injector.get(RouteParams);
    queryParams$ = injector.get(QueryParams);
  });

  afterEach(function() {
    routerInstruction$.complete();
  });

  describe('RouteParams', function() {
    it('should project route params from the current route set', function(done) {
      const params = { id: 123 };

      routeParams$.subscribe(value => {
        expect(value).toBe(params);

        done();
      });

      nextInstruction(params, {});
    });
  });

  describe('QueryParams', function() {
    it('should project query params from the current route set', function(done) {
      const query = { search: 'abcd' };

      queryParams$.subscribe(value => {
        expect(value).toBe(query);

        done();
      });

      nextInstruction({}, query);
    });
  });
});
