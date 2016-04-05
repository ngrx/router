import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Provider } from 'angular2/core';

import { RouteSet } from './route-set';

export abstract class RouteParams extends Observable<{ [param: string]: any }> { }
export abstract class QueryParams extends Observable<{ [param: string]: any }> { }

function createRouteParams(set$: RouteSet): RouteParams {
  return set$.map(next => next.params);
}

function createQueryParams(set$: RouteSet): QueryParams {
  return set$.map(next => next.query);
}

export const PARAMS_PROVIDERS = [
  new Provider(RouteParams, {
    deps: [ RouteSet ],
    useFactory: createRouteParams
  }),
  new Provider(QueryParams, {
    deps: [ RouteSet ],
    useFactory: createQueryParams
  })
];
