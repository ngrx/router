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
  ReflectiveInjector,
  Inject,
  Injector,
  OnDestroy,
  OnInit,
  ViewContainerRef,
  Attribute,
  Provider
} from '@angular/core';

import { Route, getNamedComponents } from './route';
import { RouterInstruction, NextInstruction } from './router-instruction';
import { ComponentRenderer } from './component-renderer';

@Component({
  selector: 'route-view',
  providers: [],
  template: ``
})
export class RouteView implements OnDestroy, OnInit {
  private _prev: ComponentRef;
  private _sub: any;
  private _routerInstructionProvider = new Provider(RouterInstruction, {
    useValue: this._routerInstruction$.map<NextInstruction>(set => {
      return {
        locationChange: set.locationChange,
        routeConfigs: [ ...set.routeConfigs ].slice(1),
        routeParams: set.routeParams,
        queryParams: set.queryParams
      };
    })
  });

  constructor(
    @Attribute('name') private _name: string,
    protected _routerInstruction$: RouterInstruction,
    protected _injector: Injector,
    protected _renderer: ComponentRenderer,
    protected _ref: ViewContainerRef
  ) { }

  ngOnInit() {
    this._sub = this._routerInstruction$
      .map(set => {
        const route = set.routeConfigs[0];
        const components = getNamedComponents(route, this._name);

        return { route, components };
      })
      .distinctUntilChanged((prev, next) => {
        return prev.components.component === next.components.component
            && prev.components.loadComponent === next.components.loadComponent;
      })
      .do(ins => this._cleanPreviousRef())
      .filter(({ components }) => !!components.component || !!components.loadComponent)
      .switchMap(({ route, components }) => this._renderer.render(
        route, components, this._injector, this._ref, [ this._routerInstructionProvider ]
      ))
      .subscribe((ref: ComponentRef) => this._prev = ref);
  }

  ngOnDestroy() {
    this._cleanPreviousRef();
    this._sub.unsubscribe();
  }

  protected _cleanPreviousRef() {
    if (this._prev) {
      this._prev.destroy();
      this._prev = null;
    }
  }
}
