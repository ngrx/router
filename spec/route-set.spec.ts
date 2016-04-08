import 'rxjs/add/operator/withLatestFrom';
import { Injector, provide } from 'angular2/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { LocationStrategy } from 'angular2/src/router/location/location_strategy';
import { MockLocationStrategy } from 'angular2/src/mock/mock_location_strategy';

import { RouteTraverser } from '../lib/route-traverser';
import { Location, LOCATION_PROVIDERS } from '../lib/location';
import { NextInstruction, RouterInstruction, ROUTE_SET_PROVIDERS } from '../lib/router-instruction';


describe('Route Set', function() {
  const params = [1, 2, 3];
  const routes = ['a', 'c', 'c'];

  let mockTraverser: any;
  let routerInstruction: RouterInstruction;
  let location: Location;

  beforeEach(function() {
    mockTraverser = {
      find() {
        return Observable.of({ routes, params });
      }
    };

    spyOn(mockTraverser, 'find').and.callThrough();

    const injector = Injector.resolveAndCreate([
      LOCATION_PROVIDERS,
      ROUTE_SET_PROVIDERS,
      provide(RouteTraverser, { useValue: mockTraverser }),
      provide(LocationStrategy, { useClass: MockLocationStrategy })
    ]);

    routerInstruction = injector.get(RouterInstruction);
    location = injector.get(Location);
  });

  it('should parse a simple location change into a new route set', function(done) {
    location.go('/test');

    routerInstruction
      .withLatestFrom(location)
      .subscribe(([set, change]) => {
        expect(set.routeConfigs).toBe(routes);
        expect(set.routeParams).toBe(params);
        expect(set.queryParams).toBeDefined();
        expect(set.locationChange).toBe(change);

        done();
      });

  });

  it('should parse a location change with query params', function(done) {
    location.go('/test?a=2');

    routerInstruction.subscribe(set => {
      expect(set.queryParams.a).toBeDefined();
      expect(set.queryParams.a).toBe('2');

      done();
    });
  });

  it('should share a subscription amonst all subscribers', function() {
    location.go('/');

    routerInstruction.subscribe();
    routerInstruction.subscribe();

    expect(mockTraverser.find).toHaveBeenCalledTimes(1);
  });
});
