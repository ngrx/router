import { Subject } from 'rxjs/Subject';
import { Injector, provide } from 'angular2/core';
import { NextRoute } from '../lib/route-set';
import { Middleware } from '../lib/middleware';
import { redirectMiddleware } from '../lib/redirect';
import { Location } from '../lib/location';

describe('Redirect Middleware', function() {
  let redirect: Middleware;
  let routeSet$: Subject<NextRoute>;
  let location = { replaceState(next: string) { } };
  let observer = { next() { } };

  function nextInstruction(from: string, to: string, params: any) {
    routeSet$.next({
      routes: [ { redirectTo: to } ],
      params,
      url: from,
      query: {}
    });
  }

  beforeEach(function() {
    routeSet$ = new Subject<NextRoute>();
    spyOn(location, 'replaceState');
    spyOn(observer, 'next');
    const injector = Injector.resolveAndCreate([
      provide(Location, { useValue: location })
    ]);

    redirect = injector.resolveAndInstantiate(redirectMiddleware);
  });

  afterEach(function() {
    routeSet$.complete();
  });

  it('should skip route sets that are not redirects', function(done) {
    const nextRoute: NextRoute = {
      routes: [ { path: '/first' } ],
      params: {},
      url: '/first',
      query: {}
    };

    redirect(routeSet$).subscribe(value => {
      expect(value).toBe(nextRoute);
      done();
    });

    routeSet$.next(nextRoute);
  });

  it('should correctly redirect basic paths', function() {
    redirect(routeSet$).subscribe(observer);

    routeSet$.next({
      routes: [ { redirectTo: '/test' }],
      params: {},
      url: '/go',
      query: {}
    });

    expect(observer.next).not.toHaveBeenCalled();
    expect(location.replaceState).toHaveBeenCalledWith('/test');
  });

  it('should correctly redirect paths with params', function() {
    redirect(routeSet$).subscribe(observer);

    routeSet$.next({
      routes: [ { redirectTo: '/posts/:id' } ],
      params: { id: '543' },
      url: '/blog/543',
      query: {}
    });

    expect(observer.next).not.toHaveBeenCalled();
    expect(location.replaceState).toHaveBeenCalledWith('/posts/543');
  });

  it('should redirect relative paths', function() {
    redirect(routeSet$).subscribe(observer);

    routeSet$.next({
      routes: [ { path: '/first' }, { path: 'second', redirectTo: '/home' } ],
      params: {},
      url: '/first/second',
      query: {}
    });

    expect(observer.next).not.toHaveBeenCalled();
    expect(location.replaceState).toHaveBeenCalledWith('/home');
  });

  it('should redirect relative paths with params', function() {
    redirect(routeSet$).subscribe(observer);

    routeSet$.next({
      routes: [ { path: '/blog' }, { path: ':id', redirectTo: '/posts/:id' } ],
      params: { id: '543' },
      url: '/blog/543',
      query: {}
    });

    expect(observer.next).not.toHaveBeenCalled();
    expect(location.replaceState).toHaveBeenCalledWith('/posts/543');
  });
});
