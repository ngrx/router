# Route Params
The Router exposes route parameters using an observable service. With it you can subscribe to route parameter changes or use the `select` method to listen to a particular parameter:

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

  constructor(params$: RouteParams) {
    this.id$ = params$.select('id');
  }
}
```

Because parameters are exposed as an observable, the router __does not re-render components when parameters change__. There is also no synchronous way to get the current route parameters. This is a big difference between the ngrx/router and other routers.

###Usage
To demonstrate how to work around this, lets take the above `PostPage` component and rewrite it to fetch the post from the server. If the post doesn't exist, we should redirect the user to the 404 page:

```ts
import { Observable } from 'rxjs/Observable';
import { Http } from 'angular2/http';
import { RouteParams, Location } from '@ngrx/router';

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

  constructor(params$: RouteParams, http: Http) {
    // Listen for the ID to change
    this.post$ = params$.select('id')
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
            location.replaceState('/404');
            return Observable.of(false);
          })
      });
  }
}
```
