# Route and Query Params
The Router exposes route and query parameters using observable services.

Using `RouteParams`:
```ts
import { RouteParams } from '@ngrx/router';

@Component({
  selector: 'post-page',
  template: `
    Current ID: {{ id$ | async }}
  `
})
export class PostPage {
  id$: Observable<string>;

  constructor(routeParams$: RouteParams) {
    this.id$ = routeParams$.pluck('id');
  }
}
```

Using `QueryParams`:
```
import { QueryParams } from '@ngrx/router';

@Component({
  selector: 'search-posts-page',
  template: `
    Current search: {{ search$ | async }}
  `
})
export class SearchPostsPage {
  search$: Observable<string>;

  constructor(queryParams$: QueryParams) {
    this.search$ = queryParams$.pluck('search');
  }
}
```

Because parameters are exposed as an observable, the router __does not re-render components when parameters change__. There is also no synchronous way to get the current route or query parameters. This is a big difference between ngrx/router and other routers.

### Usage
To demonstrate how to work around this, lets take the above `PostPage` component and rewrite it to fetch the post from the server. If the post doesn't exist, we should redirect the user to the 404 page:

```ts
import { Observable } from 'rxjs/Observable';
import { Http } from 'angular2/http';
import { RouteParams, Router } from '@ngrx/router';

@Component({
  selector: 'post-page',
  template: `
    <h3>{{ (post$ | async).title }}</h3>
    <span *ngIf="loading">LOADING POST</span>
  `
})
export class PostPage {
  post$: Observable<Post>;
  loading: boolean;

  constructor(params$: RouteParams, http: Http, router: Router) {
    // Listen for the ID to change
    this.post$ = params$.pluck('id')
      // only update if `id` changes
      .distinctUntilChanged()
      // Request the post from the server when the ID updates
      .mergeMap(id => {
        // Mark that we are loading a new post:
        this.loading = true;

        return http.get(`/api/posts/${id}`)
          .map(res => {
            // Mark that we have finished loading a new post:
            this.loading = false;
            // If the request succeeds, parse the JSON response
            return res.json();
          })
          // If the request fails, go to the 404 route
          .catch(err => {
            router.replace('/404');
            return Observable.of(false);
          })
      });
  }
}
```
