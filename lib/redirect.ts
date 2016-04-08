/**
 * Redirection happens in middleware. This is a fork of react-router's
 * Redirect component
 */
import { Observable } from 'rxjs/Observable';
import { Provider } from 'angular2/core';

import { Location } from './location';
import { Routes, Route } from './route';
import { useRouterInstructionMiddleware, RouterInstruction, NextInstruction } from './router-instruction';
import { createMiddleware } from './middleware';
import { formatPattern } from './match-pattern';

export const redirectMiddleware = createMiddleware(function(location: Location) {
  return (next$: RouterInstruction): RouterInstruction => next$
    .filter(next => {
      const last = next.routeConfigs[next.routeConfigs.length - 1];

      if ( !!last.redirectTo ) {
        handleRedirect(location, last, next);
        return false;
      }

      return true;
    });
}, [ Location ]);

function handleRedirect(location: Location, route: Route, next: NextInstruction) {
  const { routeParams, queryParams } = next;

  let pathname;

  if ( route.redirectTo.charAt(0) === '/' ) {
    pathname = formatPattern(route.redirectTo, routeParams);
  }
  else {
    const routeIndex = next.routeConfigs.indexOf(route);
    const parentPattern = getRoutePattern(next.routeConfigs, routeIndex - 1);
    const pattern = parentPattern.replace(/\/*$/, '/') + route.redirectTo;
    pathname = formatPattern(pattern, routeParams);
  }

  location.replaceState(pathname, queryParams);
}

function getRoutePattern(routes: Routes, routeIndex: number) {
  let parentPattern = '';

  for ( let i = routeIndex; i >= 0; i-- ) {
    const route = routes[i];
    const pattern = route.path || '';

    parentPattern = pattern.replace(/\/*$/, '/') + parentPattern;

    if ( pattern.indexOf('/') === 0 )
      break;
  }

  return '/' + parentPattern;
}

export const REDIRECT_PROVIDERS = [
  useRouterInstructionMiddleware(redirectMiddleware)
];
