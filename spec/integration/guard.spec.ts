import 'rxjs/add/operator/skip';
import 'rxjs/add/operator/take';
import { ReflectiveInjector, Component, Injectable } from '@angular/core';
import { describe, it, beforeEach, beforeEachProviders, async, inject } from '@angular/core/testing';
import { LocationStrategy } from '@angular/common';
import { MockLocationStrategy } from '@angular/common/testing';
import { Observable } from 'rxjs/Observable';

import { provideRouter, Guard, Routes, Route, RouterInstruction, Router } from '../../lib';


describe('Guards (Integration)', function() {
  let notFoundRoute: Route;
  let redirectRoute: Route;
  let aboutRoute: Route;
  let pathlessRoute: Route;
  let allowedRoute: Route;

  class TestGuard implements Guard {
    protectRoute() {
      return Observable.of(true);
    }
  }

  @Injectable()
  class RedirectGuard implements Guard {
    constructor(private router: Router) { }

    protectRoute() {
      this.router.replace('/about');

      return Observable.of(false);
    }
  }

  @Component({
    selector: 'test-component',
    template: `This is a test`
  })
  class TestComponent { }

  const routes: Routes = [
    {
      path: '/',
      component: TestComponent
    },
    aboutRoute = {
      path: '/about',
      component: TestComponent
    },
    pathlessRoute = {
      component: TestComponent,
      guards: [ TestGuard ],
      children: [
        { path: 'denied', component: TestComponent },
        allowedRoute = { path: 'allowed', component: TestComponent }
      ]
    },
    redirectRoute = {
      path: '/redirect',
      component: TestComponent,
      guards: [ RedirectGuard ]
    },
    notFoundRoute = {
      path: '*',
      component: TestComponent
    }
  ];

  let router: Router;
  let guard: Guard;
  let instruction: RouterInstruction;

  beforeEachProviders(() => [
    provideRouter(routes, MockLocationStrategy),
    TestGuard
  ]);

  beforeEach(inject([ Router, TestGuard, RouterInstruction ], function(
    _router: Router,
    _guard: TestGuard,
    _instruction: RouterInstruction
  ) {
    router = _router;
    guard = _guard;
    instruction = _instruction;
  }));

  it('should be able to allow candidate routes through', function(done) {
    spyOn(guard, 'protectRoute').and.returnValue(Observable.of(true));

    instruction.take(1).subscribe({
      next(val) {
        expect(val.routes).toEqual([ pathlessRoute, allowedRoute ]);
      },
      error: done,
      complete: done
    });

    router.go('/allowed');
  });

  it('should not run the guards multiple times', function(done) {
    spyOn(guard, 'protectRoute').and.callThrough();

    instruction.take(1).subscribe({
      next(val) {
        expect(val.locationChange.path).toBe('/allowed');
        expect(guard.protectRoute).toHaveBeenCalledTimes(1);
      },
      error: done,
      complete: done
    });

    router.go('/allowed');
  });

  it('should be able to cause candidate routes to be skipped', function(done) {
    spyOn(guard, 'protectRoute').and.returnValue(Observable.of(false));

    instruction.take(1).subscribe({
      next(val) {
        expect(val.routes[0]).toBe(notFoundRoute);
      },
      error: done,
      complete: done
    });

    router.go('/denied');
  });

  it('should be able to fire location changes that cancel the in-flight traversal', function(done) {
    const spy = jasmine.createSpy('next');

    instruction.subscribe({
      next: spy,
      error: done,
      complete() {
        expect(spy).toHaveBeenCalledTimes(1);
        done();
      }
    });

    router.go('/redirect');
    setTimeout(() => router.complete(), 5);
  });

  it('should not cause you to fall out of the zone', function(done) {
    instruction.take(1).subscribe({
      next() {
        expect((window as any).Zone.current.name).toBe('angular');
      },
      error: done,
      complete: done
    });

    router.go('/allowed');
  });
});
