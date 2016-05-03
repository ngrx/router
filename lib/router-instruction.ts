/**
 * RouteSet is a projection of the current location. It maps location changes
 * into parsed route params and a list of components to render
 */
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/publishReplay';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/observeOn';
import { Observable } from 'rxjs/Observable';
import { asap } from 'rxjs/scheduler/asap';
import { Provider, Injector, OpaqueToken, Inject, Optional, Injectable } from '@angular/core';
import { parse as parseQueryString } from 'query-string';

import { ZoneOperator } from './zone';
import { Router, LocationChange } from './router';
import { Routes, Route, ROUTES } from './route';
import { RouteTraverser, Match } from './route-traverser';
import { Hook, composeHooks } from './hooks';

export const ROUTER_HOOKS = new OpaqueToken('@ngrx/router Router Hooks');
export const INSTRUCTION_HOOKS = new OpaqueToken('@ngrx/router Instruction Hooks');


export abstract class RouterInstruction extends Observable<Match> { }

@Injectable()
export class RouterInstructionFactory {
  constructor(
    private _router$: Router,
    private _traverser: RouteTraverser,
    private _zoneOperator: ZoneOperator<Match>,
    @Optional() @Inject(ROUTER_HOOKS)
      private _routerHooks: Hook<LocationChange>[] = [],
    @Optional() @Inject(INSTRUCTION_HOOKS)
      private _instructionHooks: Hook<Match>[] = []
  ) { }

  create(): RouterInstruction {
    return this._router$
      .observeOn(asap)
      .distinctUntilChanged((prev, next) => prev.path === next.path)
      .let(composeHooks(this._routerHooks))
      .switchMap(change => this._traverser.find(change))
      .filter(match => !!match)
      .let(composeHooks(this._instructionHooks))
      .lift(this._zoneOperator)
      .publishReplay(1)
      .refCount();
  }
}


export const ROUTER_INSTRUCTION_PROVIDERS = [
  new Provider(RouterInstruction, {
    deps: [ RouterInstructionFactory ],
    useFactory(rif: RouterInstructionFactory) {
      return rif.create();
    }
  }),
  new Provider(RouterInstructionFactory, { useClass: RouterInstructionFactory })
];
