/**
 * Guards are services that can protect routes from being traversed. They
 * are implemented using traversal hooks
 *
 * A guard's `protectRoute` method is called when the router begins traversing a
 * route configuration file. It returns `true` or `false` to let the router know
 * if it should consider the route a candidate. Using guards, you can auth
 * protect routes, run data fetching, etc.
 *
 * A limitation of guards is that they must be provided in the same place you
 * provide the router.
 */
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/every';
import { Observable } from 'rxjs/Observable';
import { Inject, Injectable, Provider, OpaqueToken, Injector, ReflectiveInjector } from '@angular/core';

import { createProviderFactory } from './util';
import { Route } from './route';
import { TRAVERSAL_HOOKS, TraversalCandidate } from './route-traverser';
import { Hook } from './hooks';

export interface Guard {
  protectRoute(candidate: TraversalCandidate): Observable<boolean>;
}


@Injectable()
export class GuardHook implements Hook<TraversalCandidate> {
  constructor(@Inject(Injector) private _injector: ReflectiveInjector) { }

  resolveGuard(token: any): Guard {
    let guard = this._injector.get(token, null);

    if ( guard === null ) {
      guard = this._injector.resolveAndInstantiate(token);
    }

    return guard;
  }

  apply(route$: Observable<TraversalCandidate>): Observable<TraversalCandidate> {
    return route$.mergeMap(candidate => {
      const { route } = candidate;
      if ( !!route.guards && Array.isArray(route.guards) && route.guards.length > 0 ) {
        const guards: Guard[] = route.guards.map(token => this.resolveGuard(token));
        const activated = guards.map(guard => guard.protectRoute(candidate));

        return Observable.merge(...activated)
          .every(value => !!value)
          .map(passed => {
            if ( passed ) {
              return candidate;
            }

            return Object.assign({}, candidate, { route: null });
          });
      }

      return Observable.of(candidate);
    });
  }
}

export const GUARD_PROVIDERS = [
  new Provider(TRAVERSAL_HOOKS, { useClass: GuardHook, multi: true })
];
