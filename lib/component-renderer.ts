import 'rxjs/add/observable/of';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import {
  DynamicComponentLoader,
  ElementRef,
  Injector,
  Injectable,
  Inject,
  Type,
  Provider,
  ResolvedProvider,
  OpaqueToken,
  ComponentRef
} from 'angular2/core';
import { Observable } from 'rxjs/Observable';

import { Async, ResourceLoader } from './resource-loader';
import { compose } from './util';
import { Route, BaseRoute } from './route';
import { Middleware, identity, provideMiddlewareForToken } from './middleware';

const PRE_RENDER_MIDDLEWARE = new OpaqueToken(
  '@ngrx/router Pre Render Middleware'
);

const POST_RENDER_MIDDLEWARE = new OpaqueToken(
  '@ngrx/router Post Render Middleware'
);

export const usePreRenderMiddleware = provideMiddlewareForToken(
  PRE_RENDER_MIDDLEWARE
);

export const usePostRenderMiddleware = provideMiddlewareForToken(
  POST_RENDER_MIDDLEWARE
);

export interface RenderInstruction {
  component: Type;
  injector: Injector;
  providers: Provider[];
}

@Injectable()
export class ComponentRenderer {
  constructor(
    private _loader: ResourceLoader,
    @Inject(PRE_RENDER_MIDDLEWARE) private _preMiddleware: Middleware[],
    @Inject(POST_RENDER_MIDDLEWARE) private _postMiddleware: Middleware[]
  ) { }

  render(
    route: Route,
    components: BaseRoute,
    injector: Injector,
    ref: ElementRef,
    dcl: DynamicComponentLoader,
    providers: Provider[]
  ) {
    return Observable.of(route)
      .mergeMap(route => this._loadComponent(components))
      .map<RenderInstruction>(component => {
        return { component, injector, providers };
      })
      .let<RenderInstruction>(compose(...this._preMiddleware))
      .mergeMap(instruction => {
        const providers = Injector.resolve(instruction.providers);
        const component = instruction.component;

        return dcl.loadNextToLocation(component, ref, providers);
      })
      .let<ComponentRef>(compose(...this._postMiddleware));
  }

  private _loadComponent(route: BaseRoute): Promise<Type> {
    return this._loader.load(route.component, route.loadComponent);
  }
}

export const COMPONENT_RENDERER_PROVIDERS = [
  usePreRenderMiddleware(identity),
  usePostRenderMiddleware(identity),
  new Provider(ComponentRenderer, { useClass: ComponentRenderer })
];
