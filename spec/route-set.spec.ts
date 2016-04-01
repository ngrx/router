import { Injector, provide } from 'angular2/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { LocationStrategy } from 'angular2/src/router/location/location_strategy';
import { MockLocationStrategy } from 'angular2/src/mock/mock_location_strategy';

import { RouteTraverser } from '../lib/match-route';
import { Location, LOCATION_PROVIDERS } from '../lib/location';
import { NextRoute, RouteSet, ROUTE_SET_PROVIDERS } from '../lib/route-set';


describe('Route Set', function() {
  const params = [1, 2, 3];
  const routes = ['a', 'c', 'c'];

  let mockTraverser: any;
  let routeSet: RouteSet;
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

    routeSet = injector.get(RouteSet);
    location = injector.get(Location);
  });

  it('should parse a simple location change into a new route set', function(done) {
    location.go('/test');

    routeSet.subscribe(set => {
      expect(set.routes).toBe(routes);
      expect(set.params).toBe(params);
      expect(set.query).toBeDefined();
      expect(set.url).toBe('/test');

      done();
    });

  });

  it('should parse a location change with query params', function(done) {
    location.go('/test?a=2');

    routeSet.subscribe(set => {
      expect(set.query.a).toBeDefined();
      expect(set.query.a).toBe('2');

      done();
    });
  });

  it('should share a subscription amonst all subscribers', function() {
    location.go('/');

    routeSet.subscribe();
    routeSet.subscribe();

    expect(mockTraverser.find).toHaveBeenCalledTimes(1);
  });
});
