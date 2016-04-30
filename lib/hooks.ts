import { Observable } from 'rxjs/Observable';
import { compose } from './util';

export interface Hook<T> {
  apply(input$: Observable<T>): Observable<T>;
}

export const identity: Hook<any> = {
  apply(input$) {
    return input$;
  }
};

export function composeHooks<T>(hooks: Hook<T>[]): (input$: Observable<T>) => Observable<T> {
  const allHooks = !hooks ? [ identity ] : [ identity, ...hooks ];
  const resolved = allHooks.map(hook => (input$: Observable<T>) => hook.apply(input$));
  return compose(...resolved);
}
