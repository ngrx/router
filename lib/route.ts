/**
 * Route and IndexRoute interfaces are similar to react-router's interfaces.
 */
import { Observable } from 'rxjs/Observable';
import { Provider, Type, OpaqueToken } from '@angular/core';

import { Async } from './resource-loader';

export type Routes = Array<Route>;

export interface BaseRoute {
  component?: Type;
  loadComponent?: Async<Type>;
}

export interface IndexRoute extends BaseRoute {
  components?: { [name: string]: Type };
  loadComponents?: { [name: string]: Async<Type> };
  redirectTo?: string;
  options?: any;
}

export interface Route extends IndexRoute {
  path?: string;
  guards?: any[];
  indexRoute?: IndexRoute;
  loadIndexRoute?: Async<IndexRoute>;
  children?: Routes;
  loadChildren?: Async<Routes>;
}

export const ROUTES = new OpaqueToken('@ngrx/router Init Routes');

export function getNamedComponents(route: IndexRoute, name?: string): BaseRoute {
  if (!route) {
    return { component: null, loadComponent: null };
  }

  if (!name) {
    return { component: route.component, loadComponent: route.loadComponent };
  }

  const components = route.components || {};
  const loadComponents = route.loadComponents || {};

  return { component: components[name], loadComponent: loadComponents[name] };
}
