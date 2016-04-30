/**
 * This is a fork of the Location service in Angular 2's Component Router.
 * It exposes location updates as a BehaviorSubject, letting the router
 * observe location changes.
 */
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subscriber } from 'rxjs/Subscriber';
import { LocationStrategy, UrlChangeEvent, PlatformLocation } from '@angular/common';
import { BrowserPlatformLocation } from '@angular/platform-browser';
import { Injectable, Inject, Provider, provide } from '@angular/core';
import { stringify as stringifyQueryParams } from 'query-string';

export interface LocationChange {
  path: string;
  type: 'push' | 'pop' | 'replace';
}

@Injectable()
export class Router extends ReplaySubject<LocationChange> {
  private _baseHref: string;

  constructor(public platformStrategy: LocationStrategy) {
    super(1);

    platformStrategy.onPopState(event => this._update('pop'));

    const browserBaseHref = this.platformStrategy.getBaseHref();
    this._baseHref = stripTrailingSlash(stripIndexHtml(browserBaseHref));
    this._update('push');
  }

  private _update(type: 'push' | 'pop' | 'replace') {
    this.next({ path: this.path(), type });
  }

  /**
   * Returns the normalized URL path.
   */
  path(): string {
    return this.normalize(this.platformStrategy.path());
  }

  /**
   * Given a string representing a URL, returns the normalized URL path without leading or
   * trailing slashes
   */
  normalize(url: string): string {
    return stripTrailingSlash(_stripBaseHref(this._baseHref, stripIndexHtml(url)));
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
    return this.platformStrategy.prepareExternalUrl(url + normalizeQueryParams(normalizeQuery(query)));
  }

  /**
   * Changes the browsers URL to the normalized version of the given URL, and pushes a
   * new item onto the platform's history.
   */
  go(path: string, query: any = ''): void {
    this.platformStrategy.pushState(null, '', path, normalizeQuery(query));
    this._update('push');
  }

  /**
   * Changes the browsers URL to the normalized version of the given URL, and replaces
   * the top item on the platform's history stack.
   */
  replace(path: string, query: any = ''): void {
    this.platformStrategy.replaceState(null, '', path, normalizeQuery(query));
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

function _stripBaseHref(baseHref: string, url: string): string {
  if (baseHref.length > 0 && url.startsWith(baseHref)) {
    return url.substring(baseHref.length);
  }
  return url;
}

function stripIndexHtml(url: string): string {
  if (/\/index.html$/g.test(url)) {
    // '/index.html'.length == 11
    return url.substring(0, url.length - 11);
  }
  return url;
}

function stripTrailingSlash(url: string): string {
  if (/\/$/g.test(url)) {
    url = url.substring(0, url.length - 1);
  }
  return url;
}

function normalizeQuery(query: any) {
  return typeof query === 'string' ? query : stringifyQueryParams(query);
}

function normalizeQueryParams(params: string): string {
  return (params.length > 0 && params.substring(0, 1) !== '?') ? ('?' + params) : params;
}

export const ROUTER_PROVIDERS = [
  provide(Router, { useClass: Router }),
  provide(PlatformLocation, { useClass: BrowserPlatformLocation })
];
