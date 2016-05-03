import { Subject } from 'rxjs/Subject';
import { ReflectiveInjector, provide } from '@angular/core';

import { RouterInstruction } from '../lib/router-instruction';
import { Match } from '../lib/route-traverser';
import { RouteParams, QueryParams, PARAMS_PROVIDERS } from '../lib/params';


describe('Params Services', function() {
  let routerInstruction$: Subject<Match>;
  let routeParams$: RouteParams;
  let queryParams$: QueryParams;

  function nextInstruction(routeParams, queryParams) {
    routerInstruction$.next({
      routes: [],
      routeParams,
      queryParams,
      locationChange: {
        type: 'push',
        path: ''
      }
    });
  }

  beforeEach(function() {
    routerInstruction$ = new Subject<Match>();
    const injector = ReflectiveInjector.resolveAndCreate([
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
