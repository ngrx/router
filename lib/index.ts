import { Provider, provide, Type, PLATFORM_DIRECTIVES } from '@angular/core';
import { LocationStrategy, PathLocationStrategy, HashLocationStrategy } from '@angular/common';

// Providers
import { ROUTER_PROVIDERS as ROUTER_SERVICE_PROVIDERS } from './router';
import { ROUTER_INSTRUCTION_PROVIDERS } from './router-instruction';
import { REDIRECT_PROVIDERS } from './redirect';
import { ROUTES, Routes } from './route';
import { GUARD_PROVIDERS } from './guard';
import { MATCH_ROUTE_PROVIDERS } from './route-traverser';
import { COMPONENT_RENDERER_PROVIDERS } from './component-renderer';
import { PARAMS_PROVIDERS } from './params';
import { RESOURCE_LOADER_PROVIDERS } from './resource-loader';

// Directives
import { LinkTo } from './link-to';
import { LinkActive } from './link-active';
import { RouteView } from './route-view';


// Export all router providers
export const ROUTER_PROVIDERS = [
  COMPONENT_RENDERER_PROVIDERS,
  GUARD_PROVIDERS,
  MATCH_ROUTE_PROVIDERS,
  PARAMS_PROVIDERS,
  REDIRECT_PROVIDERS,
  RESOURCE_LOADER_PROVIDERS,
  ROUTER_INSTRUCTION_PROVIDERS,
  ROUTER_SERVICE_PROVIDERS
];

// Export all router directives
export const ROUTER_DIRECTIVES = [
  LinkTo,
  LinkActive,
  RouteView
];

// Export ROUTES opaque token and location strategy services
export { ROUTES, LocationStrategy, HashLocationStrategy, PathLocationStrategy };

// Export utility function for setting up providers
export function provideRouter(routes: Routes, locationStrategy: Type = PathLocationStrategy) {
  return [
    provide(LocationStrategy, { useClass: locationStrategy }),
    provide(ROUTES, { useValue: routes }),
    provide(PLATFORM_DIRECTIVES, { useValue: ROUTER_DIRECTIVES, multi: true }),
    ROUTER_PROVIDERS
  ];
}


export { Guard } from './guard';
export { LocationChange, Router } from './router';
export { RouteParams, QueryParams } from './params';
export { ROUTER_HOOKS, INSTRUCTION_HOOKS, LOCATION_CHANGES, RouterInstruction } from './router-instruction';
export { PRE_RENDER_HOOKS, POST_RENDER_HOOKS, RenderInstruction } from './component-renderer';
export { Routes, Route, IndexRoute } from './route';
export { TRAVERSAL_HOOKS, TraversalCandidate, Match } from './route-traverser';
export { LinkTo } from './link-to';
export { LinkActive, LinkActiveOptions } from './link-active';
export { RouteView } from './route-view';
export { Hook } from './hooks';
