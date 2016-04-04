/**
 * RouteSet is a projection of the current location. It maps location changes
 * into parsed route params and a list of components to render
 */
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/publishReplay';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/observeOn';
import { Observable } from 'rxjs/Observable';
import { queue } from 'rxjs/scheduler/queue';
import { provide, Provider, Injector, OpaqueToken } from 'angular2/core';
import { parse as parseQueryString } from 'query-string';

import { compose } from './util';
import { Location, LocationChange } from './location';
import { Routes, Route, ROUTES } from './route';
import { RouteTraverser, Match } from './match-route';
import { Middleware, provideMiddlewareForToken, identity } from './middleware';

const LOCATION_MIDDLEWARE = new OpaqueToken('@ngrx/router Location Middleware');
const ROUTE_SET_MIDDLEWARE = new OpaqueToken('@ngrx/router Route Set Middleware');

export const useLocationMiddleware = provideMiddlewareForToken(LOCATION_MIDDLEWARE);
export const useRouteSetMiddleware = provideMiddlewareForToken(ROUTE_SET_MIDDLEWARE);

export interface NextRoute {
  routes: Routes;
  params: any;
  query: any;
  url: string;
}


export class RouteSet extends Observable<NextRoute> { }


function createRouteSet(
  location$: Location,
  traverser: RouteTraverser,
  locationMiddleware: Middleware[],
  routeSetMiddleware: Middleware[]
): RouteSet {
  return location$
    .observeOn(queue)
    .distinctUntilChanged((prev, next) => prev.path === next.path)
    .let<LocationChange>(compose(...locationMiddleware))
    .switchMap(change => {
      const [ pathname, queryString ] = change.path.split('?');

      return traverser.find(pathname)
        .map<NextRoute>(set => {
          return {
            url: location$.path(),
            routes: set.routes,
            query: parseQueryString(queryString),
            params: set.params
          };
        });
    })
    .filter(match => !!match)
    .let<NextRoute>(compose(...routeSetMiddleware))
    .publishReplay(1)
    .refCount();
}


export const ROUTE_SET_PROVIDERS = [
  provide(RouteSet, {
    deps: [ Location, RouteTraverser, LOCATION_MIDDLEWARE, ROUTE_SET_MIDDLEWARE ],
    useFactory: createRouteSet
  }),
  useLocationMiddleware(identity),
  useRouteSetMiddleware(identity)
];
