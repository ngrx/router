/**
 * Redirection happens in middleware. This is a fork of react-router's
 * Redirect component
 */
import { Observable } from 'rxjs/Observable';
import { Provider } from 'angular2/core';

import { Location } from './location';
import { Routes, Route } from './route';
import { useRouteSetMiddleware, NextRoute } from './route-set';
import { createMiddleware } from './middleware';
import { formatPattern } from './match-pattern';

export const redirectMiddleware = createMiddleware(function(location: Location) {
  return (next$: Observable<NextRoute>) => next$
    .filter(next => {
      const last = next.routes[next.routes.length - 1];

      if( !!last.redirectTo ) {
        handleRedirect(location, last, next);
        return false;
      }

      return true;
    })
}, [ Location ]);

function handleRedirect(location: Location, route: Route, next: NextRoute) {
  const { url, params } = next;

  let pathname;

  if( route.redirectTo.charAt(0) === '/' ) {
    pathname = formatPattern(route.redirectTo, params);
  }
  else {
    const routeIndex = next.routes.indexOf(route);
    const parentPattern = getRoutePattern(next.routes, routeIndex - 1);
    const pattern = parentPattern.replace(/\/*$/, '/') + route.redirectTo;
    pathname = formatPattern(pattern, params);
  }

  location.replaceState(pathname);
}

function getRoutePattern(routes: Routes, routeIndex: number) {
  let parentPattern = '';

  for( let i = routeIndex; i >= 0; i-- ) {
    const route = routes[i];
    const pattern = route.path || '';

    parentPattern = pattern.replace(/\/*$/, '/') + parentPattern;

    if( pattern.indexOf('/') === 0 )
      break;
  }

  return '/' + parentPattern;
}

export const REDIRECT_PROVIDERS = [
  useRouteSetMiddleware(redirectMiddleware)
];
