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

import {Injector, provide} from 'angular2/core';
import {CONST_EXPR} from 'angular2/src/facade/lang';

import {Location} from '../lib/location';
import {LocationStrategy, APP_BASE_HREF} from 'angular2/src/router/location/location_strategy';
import {MockLocationStrategy} from 'angular2/src/mock/mock_location_strategy';

describe('Location', () => {

  let locationStrategy, location;

  function makeLocation(baseHref: string = '/my/app', provider: any = CONST_EXPR([])): Location {
    locationStrategy = new MockLocationStrategy();
    locationStrategy.internalBaseHref = baseHref;
    let injector = Injector.resolveAndCreate(
        [Location, provide(LocationStrategy, {useValue: locationStrategy}), provider]);
    return location = injector.get(Location);
  }

  beforeEach(() => {
    makeLocation();
  });

  it('should not prepend urls with starting slash when an empty URL is provided',
     () => { expect(location.prepareExternalUrl('')).toEqual(locationStrategy.getBaseHref()); });

  it('should not prepend path with an extra slash when a baseHref has a trailing slash', () => {
    let location = makeLocation('/my/slashed/app/');
    expect(location.prepareExternalUrl('/page')).toEqual('/my/slashed/app/page');
  });

  it('should not append urls with leading slash on navigate', () => {
    location.go('/my/app/user/btford');
    expect(locationStrategy.path()).toEqual('/my/app/user/btford');
  });

  xit('should normalize urls on popstate', (done) => {
     locationStrategy.simulatePopState('/my/app/user/btford');
     location.subscribe((ev) => {
       expect(ev['url']).toEqual('/user/btford');
       done();
     });
   });

  it('should revert to the previous path when a back() operation is executed', () => {
    let locationStrategy = new MockLocationStrategy();
    let location = new Location(locationStrategy);

    function assertUrl(path) { expect(location.path()).toEqual(path); }

    location.go('/ready');
    assertUrl('/ready');

    location.go('/ready/set');
    assertUrl('/ready/set');

    location.go('/ready/set/go');
    assertUrl('/ready/set/go');

    location.back();
    assertUrl('/ready/set');

    location.back();
    assertUrl('/ready');
  });

  it('should incorporate the provided query values into the location change', () => {
    let locationStrategy = new MockLocationStrategy();
    let location = new Location(locationStrategy);

    location.go('/home', 'key=value');
    expect(location.path()).toEqual('/home?key=value');

    location.go('/home', { foo: 'bar' });
    expect(location.path()).toEqual('/home?foo=bar');
  });

  it('should allow you to replace query params', () => {
    let locationStrategy = new MockLocationStrategy();
    let location = new Location(locationStrategy);

    location.go('/home');
    location.search('key=value');
    expect(location.path()).toEqual('/home?key=value');

    location.search({ foo: 'bar' });
    expect(location.path()).toEqual('/home?foo=bar');
  });

  it('should replace the state when using search to update query params', () => {
    let locationStrategy = new MockLocationStrategy();
    let location = new Location(locationStrategy);

    location.go('/home');

    spyOn(location, 'replaceState');
    spyOn(location, 'go');

    location.search('key=value');
    expect(location.go).not.toHaveBeenCalled();
    expect(location.replaceState).toHaveBeenCalledWith('/home', 'key=value');
  });

  it('should update subject on location update', (done) => {
    location.go('/update/path');
    location.subscribe((ev) => {
      expect(ev.path).toEqual('/update/path');
      done();
    });
  });

  it('should update subject on location replaceState', (done) => {
    location.replaceState('/replace/path');
    location.subscribe((ev) => {
      expect(ev.path).toEqual('/replace/path');
      done();
    });
  });
});
