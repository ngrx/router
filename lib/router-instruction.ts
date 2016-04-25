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
import 'rxjs/add/operator/last';
import { Observable } from 'rxjs/Observable';
import { async } from 'rxjs/scheduler/async';
import { provide, Provider, Injector, OpaqueToken } from 'angular2/core';
import { parse as parseQueryString } from 'query-string';

import { compose } from './util';
import { Router, LocationChange } from './router';
import { Routes, Route, ROUTES } from './route';
import { RouteTraverser, Match } from './route-traverser';
import { Middleware, provideMiddlewareForToken, identity } from './middleware';

const ROUTER_MIDDLEWARE = new OpaqueToken(
  '@ngrx/router Router Middleware'
);

const ROUTER_INSTRUCTION_MIDDLEWARE = new OpaqueToken(
  '@ngrx/router Router Instruction Middleware'
);

export const useRouterMiddleware = provideMiddlewareForToken(
  ROUTER_MIDDLEWARE
);

export const useRouterInstructionMiddleware = provideMiddlewareForToken(
  ROUTER_INSTRUCTION_MIDDLEWARE
);

export interface NextInstruction {
  routeConfigs: Routes;
  routeParams: any;
  queryParams: any;
  locationChange: LocationChange;
}


export class RouterInstruction extends Observable<NextInstruction> { }


function createRouterInstruction(
  router$: Router,
  traverser: RouteTraverser,
  locationMiddleware: Middleware<LocationChange>[],
  routerInstructionMiddleware: Middleware<NextInstruction>[]
): RouterInstruction {
  return router$
    .observeOn(async)
    .distinctUntilChanged((prev, next) => prev.path === next.path)
    .let(compose(...locationMiddleware))
    .switchMap(change => {
      const [ pathname, queryString ] = change.path.split('?');

      return traverser.find(pathname)
        .map<NextInstruction>(set => {
          return {
            locationChange: change,
            routeConfigs: set.routes,
            queryParams: parseQueryString(queryString),
            routeParams: set.params
          };
        });
    })
    .filter(match => !!match)
    .let(compose(...routerInstructionMiddleware))
    .publishReplay(1)
    .refCount();
}


export const ROUTE_SET_PROVIDERS = [
  provide(RouterInstruction, {
    deps: [ Router, RouteTraverser, ROUTER_MIDDLEWARE, ROUTER_INSTRUCTION_MIDDLEWARE ],
    useFactory: createRouterInstruction
  }),
  useRouterMiddleware(identity),
  useRouterInstructionMiddleware(identity)
];
