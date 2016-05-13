/**
 * This is a fork of the Location service in Angular 2's Component Router.
 * It exposes location updates as a BehaviorSubject, letting the router
 * observe location changes.
 */
import { Subscriber } from 'rxjs/Subscriber';
import { LocationStrategy, UrlChangeEvent, PlatformLocation } from '@angular/common';
import { BrowserPlatformLocation } from '@angular/platform-browser';
import { Injectable, Inject, Provider, provide } from '@angular/core';
import { stringify as stringifyQueryParams } from 'query-string';
import { SyncSubject } from '@ngrx/core/SyncSubject';

export interface LocationChange {
  path: string;
  type: 'push' | 'pop' | 'replace';
}

@Injectable()
export class Router extends SyncSubject<LocationChange> {
  private _baseHref: string;

  constructor(public platformStrategy: LocationStrategy) {
    super({ path: _path(platformStrategy), type: 'push' });

    platformStrategy.onPopState(event => this._update('pop'));

    this._baseHref = _getBaseHref(platformStrategy);
  }

  private _update(type: 'push' | 'pop' | 'replace') {
    this.next({ path: this.path(), type });
  }

  /**
   * Returns the normalized URL path.
   */
  path(): string {
    return _path(this.platformStrategy);
  }

  /**
   * Given a string representing a URL, returns the normalized URL path without leading or
   * trailing slashes
   */
  normalize(url: string): string {
    return _normalize(this._baseHref, url);
  }

  /**
   * Given a string representing a URL, returns the platform-specific external URL path.
   * If the given URL doesn't begin with a leading slash (`'/'`), this method adds one
   * before normalizing. This method will also add a hash if `HashLocationStrategy` is
   * used, or the `APP_BASE_HREF` if the `PathLocationStrategy` is in use.
   */
  prepareExternalUrl(url: string, query: any = ''): string {
    if (url.length > 0 && !url.startsWith('/')) {
      url = '/' + url;
    }
    return this.platformStrategy.prepareExternalUrl(url + _normalizeQueryParams(_normalizeQuery(query)));
  }

  /**
   * Changes the browsers URL to the normalized version of the given URL, and pushes a
   * new item onto the platform's history.
   */
  go(path: string, query: any = ''): void {
    this.platformStrategy.pushState(null, '', path, _normalizeQuery(query));
    this._update('push');
  }

  /**
   * Changes the browsers URL to the normalized version of the given URL, and replaces
   * the top item on the platform's history stack.
   */
  replace(path: string, query: any = ''): void {
    this.platformStrategy.replaceState(null, '', path, _normalizeQuery(query));
    this._update('replace');
  }

  /**
   * Changes the browsers query parameters. Replaces the top item on the platform's
   * history stack
   */
   search(query: any = ''): void {
     const [ pathname ] = this.path().split('?');

     this.replace(pathname, query);
   }

  /**
   * Navigates forward in the platform's history.
   */
  forward(): void {
    this.platformStrategy.forward();
  }

  /**
   * Navigates back in the platform's history.
   */
  back(): void {
    this.platformStrategy.back();
  }
}

function _path(location: LocationStrategy): string {
  return _normalize(_getBaseHref(location), location.path());
}

function _normalize(baseHref: string, url: string): string {
  return _stripTrailingSlash(_stripBaseHref(baseHref, _stripIndexHtml(url)));
}

function _getBaseHref(platformStrategy): string {
  const browserBaseHref = platformStrategy.getBaseHref();
  return _stripTrailingSlash(_stripIndexHtml(browserBaseHref));
}

function _stripBaseHref(baseHref: string, url: string): string {
  if (baseHref.length > 0 && url.startsWith(baseHref)) {
    return url.substring(baseHref.length);
  }
  return url;
}

function _stripIndexHtml(url: string): string {
  if (/\/index.html$/g.test(url)) {
    // '/index.html'.length == 11
    return url.substring(0, url.length - 11);
  }
  return url;
}

function _stripTrailingSlash(url: string): string {
  if (/\/$/g.test(url)) {
    url = url.substring(0, url.length - 1);
  }
  return url;
}

function _normalizeQuery(query: any) {
  return typeof query === 'string' ? query : stringifyQueryParams(query);
}

function _normalizeQueryParams(params: string): string {
  return (params.length > 0 && params.substring(0, 1) !== '?') ? ('?' + params) : params;
}

export const ROUTER_PROVIDERS = [
  provide(Router, { useClass: Router }),
  provide(PlatformLocation, { useClass: BrowserPlatformLocation })
];
