# Route and Query Params
The Router exposes route and query parameters using observable services.

**Route Params** are required parameters provided through the route `path` in the [Route Configuration](../route.md).

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
    this.id$ = routeParams$.pluck<string>('id');
  }
}
```

**Query Params** are optional parameters provided through the URL query string `?search=Angular` that don't trigger a reload when changed.

Using `QueryParams`:
```ts
import { QueryParams } from '@ngrx/router';
// import 'rxjs/add/operator/pluck'; // You may need to import the pluck operator

@Component({
  selector: 'search-posts-page',
  template: `
    Current search: {{ search$ | async }}
  `
})
export class SearchPostsPage {
  search$: Observable<string>;

  constructor(queryParams$: QueryParams) {
    this.search$ = queryParams$.pluck<string>('search');
  }
  
  // Log out the param
  this.search$.subscribe(search => {
    console.log(search);
  });
}
```

Because parameters are exposed as an observable, the router __does not re-render components when parameters change__. There is also no synchronous way to get the current route or query parameters. This is a big difference between ngrx/router and other routers.

### Usage
To demonstrate how to work around this, lets take the above `PostPage` component and rewrite it to fetch the post from the server. If the post doesn't exist, we should redirect the user to the 404 page:

```ts
import { Observable } from 'rxjs/Observable';
import { Http } from '@angular/http';
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
    this.post$ = params$.pluck<string>('id')
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
