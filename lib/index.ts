import { Provider, provide } from 'angular2/core';
import { LocationStrategy, PathLocationStrategy } from 'angular2/router';

import { LOCATION_PROVIDERS } from './location';
import { ROUTE_PARAMS_PROVIDERS } from './route-params';
import { ROUTE_SET_PROVIDERS } from './route-set';
import { ROUTE_VIEW_PROVIDERS } from './route-view';
import { REDIRECT_PROVIDERS } from './redirect';
import { ROUTES, Routes } from './route';
import { GUARD_PROVIDERS } from './guard';
import { MATCH_ROUTE_PROVIDERS } from './match-route';
import { COMPONENT_RENDERER_PROVIDERS } from './component-renderer';

export function provideRouter(routes: Routes) {
  return [
    provide(LocationStrategy, { useClass: PathLocationStrategy }),
    provide(ROUTES, { useValue: routes }),
    LOCATION_PROVIDERS,
    ROUTE_PARAMS_PROVIDERS,
    ROUTE_SET_PROVIDERS,
    ROUTE_VIEW_PROVIDERS,
    REDIRECT_PROVIDERS,
    GUARD_PROVIDERS,
    MATCH_ROUTE_PROVIDERS,
    COMPONENT_RENDERER_PROVIDERS
  ];
}


export { Guard, createGuard } from './guard';
export { LocationChange, Location } from './location';
export { Middleware, createMiddleware } from './middleware';
export { RouteParams } from './route-params';
export { useLocationMiddleware, useRouteSetMiddleware, RouteSet, NextRoute } from './route-set';
export { useRenderMiddleware, RenderInstruction } from './component-renderer';
export { Routes, Route, IndexRoute } from './route';
export { useTraversalMiddleware } from './match-route';
