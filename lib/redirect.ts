/**
 * Redirection happens in middleware. This is a fork of react-router's
 * Redirect component
 */
import 'rxjs/add/operator/filter';
import { Observable } from 'rxjs/Observable';
import { Provider, Injectable } from 'angular2/core';

import { Router } from './router';
import { Routes, Route } from './route';
import { INSTRUCTION_HOOKS, NextInstruction } from './router-instruction';
import { formatPattern } from './match-pattern';
import { Hook } from './hooks';


@Injectable()
export class RedirectHook implements Hook<NextInstruction> {
  constructor(private router: Router) { }

  apply(next$: Observable<NextInstruction>): Observable<NextInstruction> {
    return next$
      .filter(next => {
        const last = next.routeConfigs[next.routeConfigs.length - 1];

        if (last.redirectTo) {
          this._handleRedirect(last, next);
          return false;
        }

        return true;
      });
  }

  private _handleRedirect(route: Route, next: NextInstruction) {
    const { routeParams, queryParams } = next;

    let pathname;

    if ( route.redirectTo.charAt(0) === '/' ) {
      pathname = formatPattern(route.redirectTo, routeParams);
    }
    else {
      const routeIndex = next.routeConfigs.indexOf(route);
      const parentPattern = this._getRoutePattern(next.routeConfigs, routeIndex - 1);
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

      if ( pattern.indexOf('/') === 0 )
        break;
    }

    return '/' + parentPattern;
  }
}

export const REDIRECT_PROVIDERS = [
  new Provider(INSTRUCTION_HOOKS, { useClass: RedirectHook })
];
