import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { provide, Provider, OpaqueToken } from '@angular/core';

export function createProviderFactory<T>(
  name: string,
  token = new OpaqueToken(name),
  multi = false
) {
  return function(factory: (...deps: any[]) => T, deps: any[] = []): Provider {
    return provide(token, {
      deps,
      multi,
      useFactory: factory
    });
  };
}


export function compose(...funcs) {
  return function(...args) {
    if (funcs.length === 0) {
      return args[0];
    }

    const last = funcs[funcs.length - 1];
    const rest = funcs.slice(0, -1);

    return rest.reduceRight((composed, f) => f(composed), last(...args));
  };
};
