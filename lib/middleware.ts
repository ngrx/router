/**
 * The router exposes a number of middleware entrypoints. These are utilities
 * for quickly creating injector-friendly middleware.
 */
import { Observable } from 'rxjs/Observable';
import { OpaqueToken, Provider, provide, Injector } from 'angular2/core';

import { compose, createFactoryProvider } from './util';

export interface Middleware {
  (input$: Observable<any>): Observable<any>
}

export const identity: Middleware = t => t

export function createMiddleware(
  useFactory: (...deps: any[]) => Middleware, deps?: any[]
): Provider {
  return provide(new OpaqueToken('@ngrx/store middleware'), {
    deps,
    useFactory
  });
}

export function provideMiddlewareForToken(token) {
  function isProvider(t: any): t is Provider{
    return t instanceof Provider;
  }

  return function(..._middleware: Array<Middleware | Provider>): Provider[] {
    const provider = provide(token, {
      multi: true,
      deps: [ Injector ],
      useFactory(injector: Injector){
        const middleware = _middleware.map(m => {
          if(isProvider(m)){
            return injector.get(m.token);
          }

          return m;
        });

        return compose(...middleware);
      }
    });

    const providers = _middleware.filter(isProvider) as Provider[];

    return [ ...providers, provider ];
  }
}
