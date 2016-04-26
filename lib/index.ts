import { Provider, provide } from 'angular2/core';
import { LocationStrategy, PathLocationStrategy } from 'angular2/platform/common';

import { ROUTER_PROVIDERS } from './router';
import { ROUTE_SET_PROVIDERS } from './router-instruction';
import { ROUTE_VIEW_PROVIDERS } from './route-view';
import { REDIRECT_PROVIDERS } from './redirect';
import { ROUTES, Routes } from './route';
import { GUARD_PROVIDERS } from './guard';
import { MATCH_ROUTE_PROVIDERS } from './route-traverser';
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
    MATCH_ROUTE_PROVIDERS,
    PARAMS_PROVIDERS,
    REDIRECT_PROVIDERS,
    RESOURCE_LOADER_PROVIDERS,
    ROUTE_SET_PROVIDERS,
    ROUTE_VIEW_PROVIDERS,
    ROUTER_PROVIDERS
  ];
}


export { Guard, provideGuard } from './guard';
export { LocationChange, Router } from './router';
export { Middleware, createMiddleware } from './middleware';
export { RouteParams, QueryParams } from './params';
export { useRouterMiddleware, useRouterInstructionMiddleware, RouterInstruction, NextInstruction } from './router-instruction';
export { usePreRenderMiddleware, usePostRenderMiddleware, RenderInstruction } from './component-renderer';
export { Routes, Route, IndexRoute } from './route';
export { useTraversalMiddleware, TraversalCandidate } from './route-traverser';
export { LinkTo } from './link-to';
export { LinkActive, LinkActiveOptions } from './link-active';
export { RouteView } from './route-view';
