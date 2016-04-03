/**
* This is a fork of react-router's MatchRoute. Instead of async callbacks, it
* uses observables to perform async traversal of a route trie. It is expanded
* to run route guards as part of the traversal process
*/
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/toArray';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { OpaqueToken, Provider, Inject, Injectable } from 'angular2/core';

import { fromCallback, compose } from './util';
import { matchPattern } from './match-pattern';
import { Route, IndexRoute, Routes, ROUTES } from './route';
import { Middleware, provideMiddlewareForToken, identity } from './middleware';

const TRAVERSAL_MIDDLEWARE = new OpaqueToken(
  '@ngrx/router Traversal Middleware'
);

export const useTraversalMiddleware = provideMiddlewareForToken(
  TRAVERSAL_MIDDLEWARE
);

export interface Match {
  routes: Routes;
  params: any;
};

export interface TraversalCandidate {
  route: Route,
  params: any;
  isTerminal: boolean;
}


@Injectable()
export class RouteTraverser {
  constructor(
    @Inject(TRAVERSAL_MIDDLEWARE) private _middleware: Middleware[],
    @Inject(ROUTES) private _routes: Routes
  ){ }

  find(pathname: string) {
    return this._matchRoutes(this._routes, pathname);
  }

  /**
  * Asynchronously matches the given location to a set of routes and calls
  * callback(error, state) when finished. The state object will have the
  * following properties:
  *
  * - routes       An array of routes that matched, in hierarchical order
  * - params       An object of URL parameters
  */
  private _matchRoutes(
    routes: Routes,
    pathname: string,
    remainingPathname = pathname,
    paramNames = [],
    paramValues = []
  ): Observable<Match> {
    const seekers = routes.map<Observable<Match>>(route => {
      return this._matchRouteDeep(
        route,
        pathname,
        remainingPathname,
        paramNames,
        paramValues
      )
      .catch(error => {
        console.error('Error During Traversal', error);
        return Observable.of(null);
      });
    });
    /**
     * A note about this code: it should use Observable.concat
     * to merge the seekers into an in-order sequence. However,
     * unubscribing from sequences that way seems to throw a ton
     * of empty errors. Merging and sorting works correctly, but it
     * is very aggressive and probably not as performant as concat
     * would have been.
     */
    return Observable
      .merge(...seekers)
      .toArray()
      .map(matches => {
        const valid = matches
          .filter(match => !!match)
          .sort((first, second) => second.routes.length - first.routes.length);

        return valid[0];
      });
  }

  private _matchRouteDeep(
    route: Route,
    pathname: string,
    remainingPathname: string,
    paramNames: string[],
    paramValues: string[]
  ): Observable<Match> {
    const pattern = route.path || '';

    if( pattern.charAt(0) === '/' ) {
      remainingPathname = pathname;
      paramNames = [];
      paramValues = [];
    }

    return Observable.of(route)
      .filter(() => remainingPathname !== null)
      .do(() => {
        const matched = matchPattern(pattern, remainingPathname);
        remainingPathname = matched.remainingPathname;
        paramNames = [ ...paramNames, ...matched.paramNames ];
        paramValues = [ ...paramValues, ...matched.paramValues ];
      })
      .filter(() => remainingPathname !== null)
      .map<TraversalCandidate>(() => {
        return {
          route,
          params: assignParams(paramNames, paramValues),
          isTerminal: remainingPathname === '' && !!route.path
        }
      })
      .let<TraversalCandidate>(compose(...this._middleware))
      .filter(({ route }) => !!route)
      .mergeMap(({ route, params, isTerminal }) => {
        if( isTerminal ) {
          const match: Match = {
            routes: [ route ],
            params
          };

          return getIndexRoute(route)
            .map(indexRoute => {
              if( !!indexRoute ) {
                match.routes.push(indexRoute);
              }

              return match;
            });
        }

        return getChildRoutes(route)
          .mergeMap(childRoutes => this._matchRoutes(
            childRoutes,
            pathname,
            remainingPathname,
            paramNames,
            paramValues
          ))
          .map(match => {
            if( !!match ) {
              match.routes.unshift(route);

              return match;
            }

            return null;
          });
      });
  }
}

export const MATCH_ROUTE_PROVIDERS = [
  new Provider(RouteTraverser, { useClass: RouteTraverser }),
  useTraversalMiddleware(identity)
];


export function assignParams(paramNames: string[], paramValues: string[]) {
  return paramNames.reduce(function (params, paramName, index) {
    const paramValue = paramValues && paramValues[index];

    if( Array.isArray(params[paramName]) ){
      params[paramName].push(paramValue);
    }
    else if (paramName in params) {
      params[paramName] = [ params[paramName], paramValue ];
    }
    else {
      params[paramName] = paramValue;
    }

    return params;
  }, {});
}

function getChildRoutes(route: Route): Observable<Routes> {
  if ( !!route.children ) {
    return Observable.of(route.children);
  }

  else if ( !route.loadChildren ) {
    return Observable.of([]);
  }

  return fromCallback<Routes>(route.loadChildren);
}

function getIndexRoute(route: Route): Observable<IndexRoute> {
  if ( !!route.indexRoute ) {
    return Observable.of(route.indexRoute);
  }

  else if ( !route.loadIndexRoute ) {
    return Observable.of(null);
  }

  return fromCallback<IndexRoute>(route.loadIndexRoute);
}
