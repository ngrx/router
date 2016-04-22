/**
 * Guards are simple services that can protect routes from being traversed. They
 * are implemented using traversal middleware
 *
 * A guard is called when the router begins traversing a route configuration file.
 * It returns `true` or `false` to let the router know if it should consider
 * the route a candidate. Using guards, you can auth protect routes, run data
 * fetching, etc.
 *
 * A limitation of guards is that they are instantiated with the _root_ Injector.
 * For more powerful injection, consider looking at render middleware
 */
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/every';
import { Observable } from 'rxjs/Observable';
import { provide, Provider, OpaqueToken, Injector } from 'angular2/core';

import { createProviderFactory } from './util';
import { Route } from './route';
import { useTraversalMiddleware, TraversalCandidate } from './route-traverser';
import { createMiddleware } from './middleware';

export interface Guard {
  (params: any, route: Route, isTerminal: boolean): Observable<boolean>;
}

export const provideGuard = createProviderFactory<Guard>('@ngrx/router Guard');

export const guardMiddleware = createMiddleware(function(injector: Injector) {
  return (route$: Observable<TraversalCandidate>) => route$
    .mergeMap<TraversalCandidate>(({ route, params, isTerminal }) => {
      if ( !!route.guards && Array.isArray(route.guards) && route.guards.length > 0 ) {
        const guards: Guard[] = route.guards
          .map(provider => injector.resolveAndInstantiate(provider));

        const resolved = guards.map(guard => guard(params, route, isTerminal));

        return Observable.merge(...resolved)
          .every(value => !!value)
          .map(passed => {
            if ( passed ) {
              return { route, params, isTerminal };
            }

            return { route: null, params, isTerminal };
          });
      }

      return Observable.of({ route, params, isTerminal });
    });
}, [ Injector ]);

export const GUARD_PROVIDERS = [
  useTraversalMiddleware(guardMiddleware)
];
