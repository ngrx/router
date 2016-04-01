/**
 * As implemented this component is fairly complex. It listens to the RouteSet
 * and renders the first component in the set's list. When rendering the
 * component, it re-provides RouteSet modified to include the shortened list
 * of components. Exposes a very powerful render middleware hook that could
 * be used in the future for data resolving.
 */
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import {
  Component,
  ComponentRef,
  Injector,
  provide,
  OnDestroy,
  OnInit,
  Provider,
  PLATFORM_DIRECTIVES,
  ElementRef,
  DynamicComponentLoader
} from 'angular2/core';

import { Route } from './route';
import { RouteSet, NextRoute } from './route-set';
import { ComponentRenderer } from './component-renderer';

@Component({
  selector: 'route-view',
  providers: [ ComponentRenderer ],
  template: ``
})
export class RouteView implements OnDestroy, OnInit{
  private _prev: ComponentRef;
  private _sub: any;
  private _routeSetProvider = provide(RouteSet, {
    useValue: this._routeSet$.map<NextRoute>(set => {
      return {
        url: set.url,
        routes: [ ...set.routes ].slice(1),
        params: set.params,
        query: set.query
      }
    })
  });

  constructor(
    protected _routeSet$: RouteSet,
    protected _injector: Injector,
    protected _renderer: ComponentRenderer,
    protected _dcl: DynamicComponentLoader,
    protected _ref: ElementRef
  ){ }

  ngOnInit(){
    this._sub = this._routeSet$
      .map(set => set.routes[0])
      .distinctUntilChanged()
      .do(ins => this._cleanPreviousRef())
      .filter(route => !!route && ( !!route.component || !!route.loadComponent ))
      .switchMap(route => this._renderer.render(
        route, this._injector, this._ref, this._dcl, [ this._routeSetProvider ]
      ))
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
}

export const ROUTE_VIEW_PROVIDERS = [
  provide(PLATFORM_DIRECTIVES, {
    multi: true,
    useValue: [ RouteView ]
  })
];
