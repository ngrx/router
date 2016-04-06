import { Provider, provide } from 'angular2/core';
import { LocationStrategy } from 'angular2/src/router/location/location_strategy';
import { PathLocationStrategy } from 'angular2/src/router/location/path_location_strategy';

import { LOCATION_PROVIDERS } from './location';
import { ROUTE_SET_PROVIDERS } from './route-set';
import { ROUTE_VIEW_PROVIDERS } from './route-view';
import { REDIRECT_PROVIDERS } from './redirect';
import { ROUTES, Routes } from './route';
import { GUARD_PROVIDERS } from './guard';
import { MATCH_ROUTE_PROVIDERS } from './match-route';
import { COMPONENT_RENDERER_PROVIDERS } from './component-renderer';
import { LINK_TO_PROVIDERS } from './link-to';
import { LINK_ACTIVE_PROVIDERS } from './link-active';
import { PARAMS_PROVIDERS } from './params';
import { RESOURCE_LOADER_PROVIDERS } from './resource-loader';

export function provideRouter(routes: Routes) {
  return [
    provide(LocationStrategy, { useClass: PathLocationStrategy }),
    provide(ROUTES, { useValue: routes }),
    COMPONENT_RENDERER_PROVIDERS,
    GUARD_PROVIDERS,
    LINK_ACTIVE_PROVIDERS,
    LINK_TO_PROVIDERS,
    LOCATION_PROVIDERS,
    MATCH_ROUTE_PROVIDERS,
    PARAMS_PROVIDERS,
    REDIRECT_PROVIDERS,
    RESOURCE_LOADER_PROVIDERS,
    ROUTE_SET_PROVIDERS,
    ROUTE_VIEW_PROVIDERS
  ];
}


export { Guard, createGuard } from './guard';
export { LocationChange, Location } from './location';
export { Middleware, createMiddleware } from './middleware';
export { RouteParams, QueryParams } from './params';
export { useLocationMiddleware, useRouteSetMiddleware, RouteSet, NextRoute } from './route-set';
export { usePreRenderMiddleware, usePostRenderMiddleware, RenderInstruction } from './component-renderer';
export { Routes, Route, IndexRoute } from './route';
export { useTraversalMiddleware, TraversalCandidate } from './match-route';
export { LinkTo } from './link-to';
export { LinkActive } from './link-active';
