/**
 * Redirection happens in middleware. This is a fork of react-router's
 * Redirect component
 */
import 'rxjs/add/operator/filter';
import { Observable } from 'rxjs/Observable';
import { Provider, Injectable } from '@angular/core';

import { Router } from './router';
import { Routes, Route } from './route';
import { INSTRUCTION_HOOKS } from './router-instruction';
import { Match } from './route-traverser';
import { formatPattern } from './match-pattern';
import { Hook } from './hooks';


@Injectable()
export class RedirectHook implements Hook<Match> {
  constructor(private router: Router) { }

  apply(next$: Observable<Match>): Observable<Match> {
    return next$
      .filter(next => {
        const last = next.routes[next.routes.length - 1];

        if (last.redirectTo) {
          this._handleRedirect(last, next);
          return false;
        }

        return true;
      });
  }

  private _handleRedirect(route: Route, next: Match) {
    const { routeParams, queryParams } = next;

    let pathname;

    if ( route.redirectTo.charAt(0) === '/' ) {
      pathname = formatPattern(route.redirectTo, routeParams);
    }
    else {
      const routeIndex = next.routes.indexOf(route);
      const parentPattern = this._getRoutePattern(next.routes, routeIndex - 1);
      const pattern = parentPattern.replace(/\/*$/, '/') + route.redirectTo;
      pathname = formatPattern(pattern, routeParams);
    }

    this.router.replace(pathname, queryParams);
  }

  private _getRoutePattern(routes: Routes, routeIndex: number) {
    let parentPattern = '';

    for ( let i = routeIndex; i >= 0; i-- ) {
      const route = routes[i];
      const pattern = route.path || '';

      parentPattern = pattern.replace(/\/*$/, '/') + parentPattern;
    }

    return parentPattern;
  }
}

export const REDIRECT_PROVIDERS = [
  new Provider(INSTRUCTION_HOOKS, { useClass: RedirectHook })
];
