import 'rxjs/add/observable/of';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import {
  ComponentResolver,
  ViewContainerRef,
  ReflectiveInjector,
  Injector,
  Injectable,
  Inject,
  Type,
  Provider,
  ResolvedReflectiveProvider,
  OpaqueToken,
  ComponentRef,
  Optional
} from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Async, ResourceLoader } from './resource-loader';
import { Route, BaseRoute } from './route';
import { Hook, composeHooks } from './hooks';

export const PRE_RENDER_HOOKS = new OpaqueToken('@ngrx/router Pre-Render Hooks');
export const POST_RENDER_HOOKS = new OpaqueToken('@ngrx/router Post-Render Hooks');

export interface RenderInstruction {
  component: Type;
  injector: Injector;
  providers: Provider[];
}

@Injectable()
export class ComponentRenderer {
  constructor(
    private _loader: ResourceLoader,
    private _compiler: ComponentResolver,
    @Optional() @Inject(PRE_RENDER_HOOKS)
      private _preRenderHooks: Hook<RenderInstruction>[],
    @Optional() @Inject(POST_RENDER_HOOKS)
      private _postRenderHooks: Hook<ComponentRef<any>>[]
  ) { }

  render(
    route: Route,
    components: BaseRoute,
    injector: Injector,
    ref: ViewContainerRef,
    providers: Provider[]
  ) {
    return Observable.of(route)
      .mergeMap(route => this._loadComponent(components))
      .map<RenderInstruction>(component => {
        return { component, injector, providers };
      })
      .let(composeHooks(this._preRenderHooks))
      .mergeMap(instruction => {
        const instructionInjector = ReflectiveInjector.resolveAndCreate(instruction.providers, injector);
        const component = instruction.component;

        return this._compiler.resolveComponent(component)
          .then(comp => ref.createComponent(comp, null, instructionInjector));
      })
      .let(composeHooks(this._postRenderHooks));
  }

  private _loadComponent(route: BaseRoute): Promise<Type> {
    return this._loader.load(route.component, route.loadComponent);
  }
}

export const COMPONENT_RENDERER_PROVIDERS = [
  new Provider(ComponentRenderer, { useClass: ComponentRenderer })
];
