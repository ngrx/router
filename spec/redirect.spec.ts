import { Subject } from 'rxjs/Subject';
import { ReflectiveInjector, provide } from 'angular2/core';
import { NextInstruction } from '../lib/router-instruction';
import { RedirectHook } from '../lib/redirect';
import { Router } from '../lib/router';

describe('Redirect Middleware', function() {
  let redirect: RedirectHook;
  let routeSet$: Subject<NextInstruction>;
  let router = { replace(next: string) { } };
  let observer = { next() { } };

  function nextInstruction(to: string, routeParams: any = {}, queryParams: any = {}) {
    routeSet$.next({
      routeConfigs: [ { redirectTo: to } ],
      routeParams,
      queryParams,
      locationChange: {
        type: 'push',
        path: ''
      }
    });
  }

  beforeEach(function() {
    routeSet$ = new Subject<NextInstruction>();
    spyOn(router, 'replace');
    spyOn(observer, 'next');
    const injector = ReflectiveInjector.resolveAndCreate([
      provide(Router, { useValue: router })
    ]);

    redirect = injector.resolveAndInstantiate(RedirectHook);
  });

  afterEach(function() {
    routeSet$.complete();
  });

  it('should skip route sets that are not redirects', function(done) {
    const NextInstruction: NextInstruction = {
      routeConfigs: [ { path: '/first' } ],
      routeParams: {},
      queryParams: {},
      locationChange: {
        type: 'push',
        path: ''
      }
    };

    redirect.apply(routeSet$).subscribe(value => {
      expect(value).toBe(NextInstruction);
      done();
    });

    routeSet$.next(NextInstruction);
  });

  it('should correctly redirect basic paths', function() {
    redirect.apply(routeSet$).subscribe(observer);

    nextInstruction('/test');

    expect(observer.next).not.toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith('/test', {});
  });

  it('should correctly redirect paths with params', function() {
    redirect.apply(routeSet$).subscribe(observer);

    nextInstruction('/posts/:id', { id: '543' });

    expect(observer.next).not.toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith('/posts/543', {});
  });

  it('should redirect relative paths', function() {
    redirect.apply(routeSet$).subscribe(observer);

    routeSet$.next({
      routeConfigs: [ { path: '/first' }, { path: 'second', redirectTo: '/home' } ],
      routeParams: {},
      queryParams: {},
      locationChange: {
        type: 'push',
        path: ''
      }
    });

    expect(observer.next).not.toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith('/home', {});
  });

  it('should redirect relative paths with params', function() {
    redirect.apply(routeSet$).subscribe(observer);

    routeSet$.next({
      routeConfigs: [ { path: '/blog' }, { path: ':id', redirectTo: '/posts/:id' } ],
      routeParams: { id: '543' },
      queryParams: {},
      locationChange: {
        type: 'push',
        path: ''
      }
    });

    expect(observer.next).not.toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith('/posts/543', {});
  });
});
