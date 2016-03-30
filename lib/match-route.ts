/**
 * This is a fork of react-router's MatchRoute. Instead of async callbacks, it
 * uses observables to perform async traversal of a route trie. It is expanded
 * to run route guards as part of the traversal process
 */
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/toArray';
import { Observable } from 'rxjs/Observable';
import { Injector } from 'angular2/core';

import { fromCallback } from './util';
import { matchPattern } from './match-pattern';
import { Route, IndexRoute, Routes } from './route';
import { runGuards } from './guard';

export interface Match {
  routes: Routes;
  params: any;
 };

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

export function matchRouteDeep(
  injector: Injector,
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

  if( remainingPathname !== null ) {
    const matched = matchPattern(pattern, remainingPathname);
    remainingPathname = matched.remainingPathname;
    paramNames = [ ...paramNames, ...matched.paramNames ];
    paramValues = [ ...paramValues, ...matched.paramValues ];

    if( remainingPathname === '' && route.path ) {
      const match: Match = {
        routes: [ route ],
        params: assignParams(paramNames, paramValues)
      };

      return getIndexRoute(route)
        .map(indexRoute => {
          if( !!indexRoute ) {
            match.routes.push(indexRoute);
          }

          return match;
        });
    }
  }

  if( remainingPathname != null ) {
    return getChildRoutes(route)
      .mergeMap(childRoutes => matchRoutes(
        injector,
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
  }
  else {
    return Observable.of(null);
  }
}


/**
 * Asynchronously matches the given location to a set of routes and calls
 * callback(error, state) when finished. The state object will have the
 * following properties:
 *
 * - routes       An array of routes that matched, in hierarchical order
 * - params       An object of URL parameters
 */
export function matchRoutes(
  injector: Injector,
  routes: Routes,
  pathname: string,
  remainingPathname = pathname,
  paramNames = [],
  paramValues = []
): Observable<Match> {
  const seekers = routes.map(route => {
    return runGuards(injector, route)
      .flatMap(canTraverse => {
        if( canTraverse ) {
          return matchRouteDeep(
            injector,
            route,
            pathname,
            remainingPathname,
            paramNames,
            paramValues
          );
        }

        return Observable.of(null);
      });
  });

  return Observable
    .merge(...seekers)
    .toArray()
    .map(matches => matches.filter(match => !!match))
    .map(matches => matches[0])
}
