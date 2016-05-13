import 'rxjs/add/operator/withLatestFrom';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { ReflectiveInjector, provide, NgZone, createNgZone } from '@angular/core';
import { LocationStrategy } from '@angular/common';
import { MockLocationStrategy } from '@angular/common/testing';

import { RouteTraverser } from '../lib/route-traverser';
import { Router, ROUTER_PROVIDERS } from '../lib/router';
import { RouterInstruction, ROUTER_INSTRUCTION_PROVIDERS } from '../lib/router-instruction';
import { Match } from '../lib/route-traverser';


describe('Router Instruction', function() {
  const params = [1, 2, 3];
  const routes = ['a', 'c', 'c'];

  let mockTraverser: any;
  let mockZone: any;
  let routerInstruction: RouterInstruction;
  let router: Router;

  beforeEach(function() {
    mockTraverser = {
      find(change) {
        return Observable.of<Match>({
          routes,
          routeParams: params,
          queryParams: {},
          locationChange: change
        });
      }
    };

    mockZone = {
      run(fn) {
        return fn();
      }
    };

    spyOn(mockTraverser, 'find').and.callThrough();
    spyOn(mockZone, 'run').and.callThrough();

    const injector = ReflectiveInjector.resolveAndCreate([
      ROUTER_PROVIDERS,
      ROUTER_INSTRUCTION_PROVIDERS,
      provide(RouteTraverser, { useValue: mockTraverser }),
      provide(LocationStrategy, { useClass: MockLocationStrategy }),
      provide(NgZone, { useValue: mockZone })
    ]);

    routerInstruction = injector.get(RouterInstruction);
    router = injector.get(Router);
  });

  it('should parse a simple location change into a new route set', function(done) {
    router.go('/test');

    routerInstruction
      .withLatestFrom(router)
      .subscribe(([set, change]) => {
        expect(set.routes).toBe(routes);
        expect(set.routeParams).toBe(params);
        expect(set.queryParams).toBeDefined();
        expect(set.locationChange).toBe(change);

        done();
      });

  });

  it('should share a subscription amonst all subscribers', function(done) {
    router.go('/');

    routerInstruction.subscribe();
    routerInstruction.subscribe(() => {
      expect(mockTraverser.find).toHaveBeenCalledTimes(1);

      done();
    });
  });

  it('should pass the subscription back into the Angular zone', function(done) {
    router.go('/');

    routerInstruction.subscribe(() => {
      expect(mockZone.run).toHaveBeenCalled();

      done();
    });
  });
});
