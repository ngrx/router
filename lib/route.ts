/**
 * Route and IndexRoute interfaces are similar to react-router's interfaces.
 */
import { Observable } from 'rxjs/Observable';
import { Provider, Type, OpaqueToken } from 'angular2/core';

import { Callback } from './util';

export type Routes = Array<Route>;

export interface IndexRoute {
  component?: Type;
  loadComponent?: Callback<Type>;
  redirectTo?: string;
}

export interface Route extends IndexRoute {
  path?: string;
  guards?: Provider[];
  indexRoute?: IndexRoute;
  loadIndexRoute?: Callback<IndexRoute>;
  children?: Routes;
  loadChildren?: Callback<Routes>;
}

export const ROUTES = new OpaqueToken('@ngrx/router Init Routes');
