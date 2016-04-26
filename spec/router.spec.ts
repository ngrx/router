/**
  * Copied from angular2 location test suite. Since we are using there location strategy
  * with the addition of the Behavior Subject, all tests still apply here.
  * Original test suite at: angular2/modules/angular2/test/router/location/location_spec.ts
**/

import {
  describe,
  it,
  iit,
  expect,
  beforeEach,
  beforeEachProviders
} from 'angular2/testing';

import {ReflectiveInjector, provide} from 'angular2/core';
import {CONST_EXPR} from 'angular2/src/facade/lang';

import {Router} from '../lib/router';
import {LocationStrategy, APP_BASE_HREF} from 'angular2/platform/common';
import {MockLocationStrategy} from 'angular2/src/mock/mock_location_strategy';

describe('Router', () => {

  let locationStrategy, router: Router;

  function makeRouter(baseHref: string = '/my/app', provider: any = CONST_EXPR([])): Router {
    locationStrategy = new MockLocationStrategy();
    locationStrategy.internalBaseHref = baseHref;
    let injector = ReflectiveInjector.resolveAndCreate(
        [Router, provide(LocationStrategy, {useValue: locationStrategy}), provider]);
    return router = injector.get(Router);
  }

  beforeEach(() => {
    makeRouter();
  });

  it('should not prepend urls with starting slash when an empty URL is provided',
     () => { expect(router.prepareExternalUrl('')).toEqual(locationStrategy.getBaseHref()); });

  it('should not prepend path with an extra slash when a baseHref has a trailing slash', () => {
    let router = makeRouter('/my/slashed/app/');
    expect(router.prepareExternalUrl('/page')).toEqual('/my/slashed/app/page');
  });

  it('should not append urls with leading slash on navigate', () => {
    router.go('/my/app/user/btford');
    expect(locationStrategy.path()).toEqual('/my/app/user/btford');
  });

  xit('should normalize urls on popstate', (done) => {
     locationStrategy.simulatePopState('/my/app/user/btford');
     router.subscribe((ev) => {
       expect(ev['url']).toEqual('/user/btford');
       done();
     });
   });

  it('should revert to the previous path when a back() operation is executed', () => {
    let locationStrategy = new MockLocationStrategy();
    let router = new Router(locationStrategy);

    function assertUrl(path) { expect(router.path()).toEqual(path); }

    router.go('/ready');
    assertUrl('/ready');

    router.go('/ready/set');
    assertUrl('/ready/set');

    router.go('/ready/set/go');
    assertUrl('/ready/set/go');

    router.back();
    assertUrl('/ready/set');

    router.back();
    assertUrl('/ready');
  });

  it('should incorporate the provided query values into the location change', () => {
    let locationStrategy = new MockLocationStrategy();
    let router = new Router(locationStrategy);

    router.go('/home', 'key=value');
    expect(router.path()).toEqual('/home?key=value');

    router.go('/home', { foo: 'bar' });
    expect(router.path()).toEqual('/home?foo=bar');
  });

  it('should allow you to replace query params', () => {
    let locationStrategy = new MockLocationStrategy();
    let router = new Router(locationStrategy);

    router.go('/home');
    router.search('key=value');
    expect(router.path()).toEqual('/home?key=value');

    router.search({ foo: 'bar' });
    expect(router.path()).toEqual('/home?foo=bar');
  });

  it('should replace the state when using search to update query params', () => {
    let locationStrategy = new MockLocationStrategy();
    let router = new Router(locationStrategy);

    router.go('/home');

    spyOn(router, 'replace');
    spyOn(router, 'go');

    router.search('key=value');
    expect(router.go).not.toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith('/home', 'key=value');
  });

  it('should update subject on location update', (done) => {
    router.go('/update/path');
    router.subscribe((ev) => {
      expect(ev.path).toEqual('/update/path');
      done();
    });
  });

  it('should update subject on location replace', (done) => {
    router.replace('/replace/path');
    router.subscribe((ev) => {
      expect(ev.path).toEqual('/replace/path');
      done();
    });
  });
});
