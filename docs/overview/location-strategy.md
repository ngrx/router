# Location Strategy

Angular 2 supports two kinds of routing known as location strategies.
- [PathLocationStrategy](https://angular.io/docs/js/latest/api/router/PathLocationStrategy-class.html)
- [HashLocationStrategy](https://angular.io/docs/js/latest/api/router/HashLocationStrategy-class.html)


The location strategy can be registered with ngrx/router during bootstrap, and if not specified explicitly, it will default to PathLocationStrategy.

## HashLocationStrategy

Urls will appears like example.com/#/myroute

 ```ts
  import { provideRouter } from '@ngrx/router';
  import { HashLocationStrategy } from '@angular/common';

  bootstrap(App, [
    provideRouter(routes, HashLocationStrategy)
  ]);
```
  
## PathLocationStrategy

Urls will appear like example.com/myroute

```ts
  import { provideRouter } from '@ngrx/router';
  import { PathLocationStrategy } from '@angular/common';

  bootstrap(App, [
    provideRouter(routes, PathLocationStrategy)
  ]);
```