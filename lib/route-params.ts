/**
 * Route params are just a projection of the current RouteSet. Exposed
 * as a BehaviorSubject to allow for sync access to route params and
 * replayability
 */
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilChanged';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/subject/ReplaySubject';
import { provide, Provider } from 'angular2/core';

import { RouteSet } from './route-set';

export class RouteParams extends ReplaySubject<{ [param: string]: any }> {
  constructor() {
    super(1);
  }

  select<T>(selected: string) {
    return this.map<T>(params => params[selected]).distinctUntilChanged();
  }
}

function createParams(set$: RouteSet) {
  const params$ = new RouteParams();

  set$.map(next => next.params).subscribe(params$);

  return params$;
}


export const ROUTE_PARAMS_PROVIDERS = [
  provide(RouteParams, {
    deps: [ RouteSet ],
    useFactory: createParams
  })
];
