/**
 * Route and IndexRoute interfaces are similar to react-router's interfaces.
 */
import { Observable } from 'rxjs/Observable';
import { Provider, Type, OpaqueToken } from 'angular2/core';

import { Async } from './resource-loader';

export type Routes = Array<Route>;

export interface IndexRoute {
  component?: Type;
  loadComponent?: Async<Type>;
  redirectTo?: string;
}

export interface Route extends IndexRoute {
  path?: string;
  guards?: Provider[];
  indexRoute?: IndexRoute;
  loadIndexRoute?: Async<IndexRoute>;
  children?: Routes;
  loadChildren?: Async<Routes>;
}

export const ROUTES = new OpaqueToken('@ngrx/router Init Routes');
