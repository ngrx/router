import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Provider } from '@angular/core';

import { RouterInstruction } from './router-instruction';

export abstract class RouteParams extends Observable<{ [param: string]: any }> { }
export abstract class QueryParams extends Observable<{ [param: string]: any }> { }

function createRouteParams(set$: RouterInstruction): RouteParams {
  return set$.map(next => next.routeParams);
}

function createQueryParams(set$: RouterInstruction): QueryParams {
  return set$.map(next => next.queryParams);
}

export const PARAMS_PROVIDERS = [
  new Provider(RouteParams, {
    deps: [ RouterInstruction ],
    useFactory: createRouteParams
  }),
  new Provider(QueryParams, {
    deps: [ RouterInstruction ],
    useFactory: createQueryParams
  })
];
