# Router Navigation
The Router service provides different methods to navigate programatically.

## go

The `Router.go` method navigates to a path while pushing a new history entry onto the stack. The second argument is an object for query parameters.

```ts
import { Router } from '@ngrx/router';

@Component({...})
export class Page {
  constructor(private router: Router) {}

  navigate() {
    // Navigates to /full/path/to/route
    this.router.go('/full/path/to/route');

    // Navigates to /full/path/to/route?id=1
    this.router.go('/full/path/to/route', { id: 1 });
  }
}
```

## replace

The `Router.replace` method navigates to a path while replacing the top history item on the stack. The second argument is an object for query parameters.

```ts
import { Router } from '@ngrx/router';

@Component({...})
export class Page {
  constructor(private router: Router) {}

  navigate() {
    // Navigates to /full/path/to/route
    this.router.replace('/full/path/to/route');

    // Navigates to /full/path/to/route?id=1
    this.router.replace('/full/path/to/route', { id: 1 });
  }
}
```

## search

The `Router.search` method only updates the query parameters for the current path.

```ts
import { Router } from '@ngrx/router';

@Component({...})
export class Page {
  constructor(private router: Router) {}

  updateResults() {
    // Current path is /results
    // Replaces /results with /results?page=1
    this.router.search({ page: 1 });
  }
}
```

## back

The `Router.back` method navigates back in history

```ts
import { Router } from '@ngrx/router';

@Component({...})
export class Page {
  constructor(private router: Router) {}

  goBack() {
    this.router.back();
  }
}
```

## forward

The `Router.forward` method navigates forward in history

```ts
import { Router } from '@ngrx/router';

@Component({...})
export class Page {
  constructor(private router: Router) {}

  goForward() {
    this.router.forward();
  }
}
```
