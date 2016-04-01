import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilChanged';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/subject/ReplaySubject';
import { provide, Provider } from 'angular2/core';
import { stringify as stringifyQueryParams } from 'query-string';

import { Location} from './location';
import { RouteSet } from './route-set';

export class QueryParams extends ReplaySubject<{ [param: string]: any }>{
  constructor(private _location: Location){
    super(1);
  }

  select<T>(selected: string) {
    return this.map<T>(params => params[selected]).distinctUntilChanged();
  }

  replace(params = {}) {
    const [ pathname ] = this._location.path().split('?');

    this._location.replaceState(pathname, stringifyQueryParams(params));
  }
}

function createParams(set$: RouteSet, location: Location) {
  const params$ = new QueryParams(location);

  set$.map(next => next.query).subscribe(params$);

  return params$;
}


export const QUERY_PARAMS_PROVIDERS = [
  provide(QueryParams, {
    deps: [ RouteSet, Location ],
    useFactory: createParams
  })
];
