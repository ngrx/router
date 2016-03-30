import 'rxjs/add/observable/fromPromise';
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

import { fromCallback, compose } from './util';
import { Route } from './route';
import { Middleware, identity, provideMiddlewareForToken } from './middleware';

export const RENDER_MIDDLEWARE = new OpaqueToken(
  '@ngrx/router Render Middleware'
);

export const useRenderMiddleware = provideMiddlewareForToken(
  RENDER_MIDDLEWARE
);

export interface RenderInstruction {
  component: Type;
  injector: Injector;
  providers: Provider[];
}

export interface ResolvedInstruction {
  component: Type;
  providers: ResolvedProvider[];
  ref: ElementRef;
  dcl: DynamicComponentLoader;
}

@Injectable()
export class ComponentRenderer {
  constructor(@Inject(RENDER_MIDDLEWARE) private _middleware: Middleware[]) { }

  render(
    route: Route,
    injector: Injector,
    ref: ElementRef,
    dcl: DynamicComponentLoader,
    providers: Provider[]
  ) {
    return this.loadComponentForRoute(route)
      .map<RenderInstruction>(component => {
        return { component, injector, providers };
      })
      .let<RenderInstruction>(compose(...this._middleware))
      .map<ResolvedInstruction>(instruction => {
        const providers = Injector.resolve(instruction.providers);
        const component = instruction.component;

        return { providers, component, ref, dcl }
      })
      .mergeMap(instruction => this.renderComponent(instruction));
  }

  renderComponent({ component, providers, ref, dcl }: ResolvedInstruction) {
    return Observable.fromPromise(dcl.loadNextToLocation(
      component, ref, providers
    ));
  }

  loadComponentForRoute(route: Route) {
    if( !!route.component ) {
      return Observable.of(route.component);
    }

    else if( !!route.loadComponent ) {
      return fromCallback(route.loadComponent);
    }
  }
}

export const COMPONENT_RENDERER_PROVIDERS = [
  useRenderMiddleware(identity),
  new Provider(ComponentRenderer, { useClass: ComponentRenderer })
];
