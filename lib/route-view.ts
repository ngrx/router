/**
 * As implemented this component is fairly complex. It listens to the RouteSet
 * and renders the first component in the set's list. When rendering the
 * component, it re-provides RouteSet modified to include the shortened list
 * of components. Exposes a very powerful render middleware hook that could
 * be used in the future for data resolving.
 */
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/if';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/let';
import { Observable } from 'rxjs/Observable';
import { asap } from 'rxjs/scheduler/asap';
import {
  Component,
  DynamicComponentLoader,
  ElementRef,
  ComponentRef,
  Injector,
  provide,
  OnDestroy,
  OnInit,
  Provider,
  ResolvedProvider,
  Type,
  PLATFORM_DIRECTIVES,
  OpaqueToken,
  Inject
} from 'angular2/core';

import { fromCallback, compose } from './util';
import { RouteSet, NextRoute } from './route-set';
import { Middleware, identity, provideMiddlewareForToken } from './middleware';

export const ROUTE_VIEW_MIDDLEWARE = new OpaqueToken('@ngrx/router Route View Middleware');
export const useRenderMiddleware = provideMiddlewareForToken(ROUTE_VIEW_MIDDLEWARE);

export interface RenderInstruction {
  component: Type;
  providers: ResolvedProvider[];
  injector: Injector
}

@Component({
  selector: 'route-view',
  template: ``
})
export class RouteView implements OnDestroy, OnInit{
  protected _resolvedProviders: ResolvedProvider[];
  private _prev: ComponentRef;
  private _sub: any;

  constructor(
    protected _routeSet$: RouteSet,
    protected _dcl: DynamicComponentLoader,
    protected _el: ElementRef,
    protected _injector: Injector,
    @Inject(ROUTE_VIEW_MIDDLEWARE) protected _middleware: Middleware[]
  ){
    const nextRouteSet = provide(RouteSet, {
      useValue: _routeSet$.map<NextRoute>(set => {
        return {
          url: set.url,
          routes: [ ...set.routes ].slice(1),
          params: set.params
        }
      })
    });

    this._resolvedProviders = Injector.resolve([ nextRouteSet ]);
  }

  ngOnInit(){
    this._sub = this._routeSet$
      .map(set => set.routes[0])
      .filter(route => !!route && ( !!route.component || !!route.loadComponent ))
      .distinctUntilChanged()
      .do(ins => this._cleanPreviousRef())
      .switchMap(route => {
        const sync$ = Observable.of(route.component)
        const async$ = fromCallback<Type>(route.loadComponent)

        return Observable.if(() => !!route.component, sync$, async$)
          .map<RenderInstruction>(component => {
            const providers = this._resolvedProviders;
            const injector = this._injector;

            return { component, providers, injector };
          })
          .let<RenderInstruction>(compose(...this._middleware))
          .mergeMap(({ component, providers }) =>
            this._load(component, providers));
      })
      .subscribe((ref: ComponentRef) => this._prev = ref);
  }

  ngOnDestroy(){
    this._cleanPreviousRef();
    this._sub.unsubscribe();
  }

  protected _cleanPreviousRef(){
    if(this._prev){
      this._prev.dispose();
      this._prev = null;
    }
  }

  protected _load(component: Type, providers: ResolvedProvider[]): Observable<ComponentRef>{
    this._cleanPreviousRef();

    return Observable.fromPromise(this._dcl
      .loadNextToLocation(component, this._el, providers));
  }
}

export const ROUTE_VIEW_PROVIDERS = [
  provide(PLATFORM_DIRECTIVES, {
    multi: true,
    useValue: [ RouteView ]
  }),
  useRenderMiddleware(identity)
];
