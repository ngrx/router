/**
* This is a fork of react-router's MatchRoute. Instead of async callbacks, it
* uses observables to perform async traversal of a route trie. It is expanded
* to run route guards as part of the traversal process
*/
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/take';
import { Observable } from 'rxjs/Observable';
import { OpaqueToken, Provider, Inject, Injectable, Optional } from 'angular2/core';

import { ResourceLoader, Async } from './resource-loader';
import { matchPattern, makeParams } from './match-pattern';
import { Route, IndexRoute, Routes, ROUTES } from './route';
import { Hook, composeHooks } from './hooks';

export const TRAVERSAL_HOOKS = new OpaqueToken(
  '@ngrx/router Traversal Hooks'
);

export interface Match {
  routes: Routes;
  params: any;
};

export interface TraversalCandidate {
  route: Route;
  params: any;
  isTerminal: boolean;
}


@Injectable()
export class RouteTraverser {
  constructor(
    private _loader: ResourceLoader,
    @Inject(ROUTES) private _routes: Routes,
    @Optional() @Inject(TRAVERSAL_HOOKS)
      private _hooks: Hook<TraversalCandidate>[] = []
  ) { }

  /**
  * Asynchronously matches the given location to a set of routes. The state
  * object will have the following properties:
  *
  * - routes       An array of routes that matched, in hierarchical order
  * - params       An object of URL parameters
  */
  find(pathname: string) {
    return this._matchRoutes(this._routes, pathname);
  }

  private _matchRoutes(
    routes: Routes,
    pathname: string,
    remainingPathname = pathname,
    paramNames = [],
    paramValues = []
  ): Observable<Match> {
    return Observable.from(routes)
      .concatMap(route => this._matchRouteDeep(
        route,
        pathname,
        remainingPathname,
        paramNames,
        paramValues
      ))
      .catch(error => {
        console.error('Error During Traversal', error);
        return Observable.of(null);
      })
      .filter(match => !!match)
      .take(1);
  }

  private _matchRouteDeep(
    route: Route,
    pathname: string,
    remainingPathname: string,
    paramNames: string[],
    paramValues: string[]
  ): Observable<Match> {
    const pattern = route.path || '';

    if ( pattern.charAt(0) === '/' ) {
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
          params: makeParams(paramNames, paramValues),
          isTerminal: remainingPathname === '' && !!route.path
        };
      })
      .let<TraversalCandidate>(composeHooks(this._hooks))
      .filter(({ route }) => !!route)
      .mergeMap(({ route, params, isTerminal }) => {
        if ( isTerminal ) {
          const match: Match = {
            routes: [ route ],
            params
          };

          return Observable.of(route)
            .mergeMap(route => this._loadIndexRoute(route))
            .map(indexRoute => {
              if ( !!indexRoute ) {
                match.routes.push(indexRoute);
              }

              return match;
            });
        }

        return Observable.of(route)
          .mergeMap(route => this._loadChildRoutes(route))
          .mergeMap<Match>(childRoutes => this._matchRoutes(
            childRoutes,
            pathname,
            remainingPathname,
            paramNames,
            paramValues
          ))
          .map(match => {
            if ( !!match ) {
              match.routes.unshift(route);

              return match;
            }

            return null;
          });
      });
  }

  private _loadChildRoutes(route: Route): Promise<Routes> {
    return this._loader.load(route.children, route.loadChildren, []);
  }

  private _loadIndexRoute(route: Route): Promise<Route> {
    return this._loader.load(route.indexRoute, route.loadIndexRoute, null);
  }
}

export const MATCH_ROUTE_PROVIDERS = [
  new Provider(RouteTraverser, { useClass: RouteTraverser })
];


export function assignParams(paramNames: string[], paramValues: string[]) {
  return paramNames.reduce(function (params, paramName, index) {
    const paramValue = paramValues && paramValues[index];

    if ( Array.isArray(params[paramName]) ) {
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
