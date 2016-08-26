# Migration Guide

This guide will aid in migrating from `@ngrx/router` to the `@angular/router`. This guide assumes you're on the latest release candidate of Angular 2 (RC5).

## Installation

`npm install @angular/router@latest --save`

## Setup

### @ngrx/router

```ts
import { Routes, provideRouter } from '@ngrx/router';

const routes: Routes = [
  {
    path: '/',
    component: HomePage,
    redirectTo: 'home'
  },
  {
    path: '/blog',
    component: BlogPage,
    index: {
      component: BlogPostsPage
    },    
    children: [
      {
        path: ':id',
        component: PostPage
      }
    ]
  },
  {
    path: '/blog',
    components: {
      main: Blog,
      sideMenu: RecentPosts
    }
  }  
]
```

```ts
@NgModule({
  providers: [
    provideRouter(routes)
  ]
})
export class AppModule {}
```

### @angular/router

```ts
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home'
  },
  {
    path: 'home',
    component: HomePage
  },
  {
    path: 'blog',
    component: BlogPage,
    children: [
      {
        path: '',
        component: BlogPostsPage
      },
      {
        path: ':id',
        component: PostPage
      }
    ]
  },
  {
    path: 'blog',
    component: Blog,
    outlet: 'main'
  },
  {
    path: 'blog',
    component: RecentPosts,  
    outlet: 'sideMenu'
  }
]

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ]
})
export class AppModule {}
```

### Location Strategy

To switch to the `HashLocationStrategy`

@ngrx/router

```ts
provideRouter(routes, HashLocationStrategy)
```

@angular/router

```ts
RouterModule.forRoot(routes, { useHash: true })
```

## Directives

Directive/Binding | @ngrx/router | @angular/router
------------ | ------------ | -------------
linkTo | `<a linkTo="/path">Link</a>` | `<a routerLink="/path">Link</a>`
linkTo | `<a [linkTo]="'/path' + id">Link</a>` | `<a [routerLink]="['/path', id]">Link</a>`
queryParams | `<a linkTo="/path" [queryParams]="{ page: 1 }">Link</a>` | `<a routerLink="/path" [queryParams]="{ page: 1 }">Link</a>`
fragment | `N/A` | `<a routerLink="/path" fragment="anchor">Link</a>`
linkActive | `<a linkActive="active">Link</a>` | `<a routerLinkActive="active">Link</a>`
linkActiveOptions | `<a [linkActiveOptions]="{ exact: true }">Link</a>` | `<a [routerLinkActiveOptions]="{ exact: true }">Link</a>`
route-view | `<route-view></route-view>` | `<router-outlet></router-outlet>`
route-view (named) | `<route-view name="test"></route-view>` | `<router-outlet name="test"></router-outlet>`

## Navigation

@ngrx/router | @angular/router | Notes
------------ | ------------- | -------------
`router.go('/path/to/route')` | `router.navigate(['/path/to/route'])` | *@angular/router supports relative navigation also*
`router.go('/path/to/route')` | `router.navigateByUrl('/path/to/route')` |
`router.replace('/path/to/route')` | `router.navigate(['/path/to/route'], { replaceUrl: true })` |
`router.search({ page: 1 })` | `router.navigate(['/path'], { queryParams: { page: 1 }})` |
`router.back()` | `N/A` | Inject the `Location` service from `@angular/common` and use `location.back()`
`router.forward()` | `N/A` | Inject the `Location` service from `@angular/common` and use `location.forward()`

## Route Parameters

@ngrx/router only has one set of route parameters for all components.

```ts
import { RouteParams } from '@ngrx/router';
import { Observable } from 'rxjs/Observable';

@Component({
  template: `{{ id$ | async }}`
})
export class RouteComponent {
   id$: Observable<string>;
   constructor(routeParams: RouteParams) {
     this.id$ = routeParams.pluck<string>('id');
   }
}
```

@angular/router has an `ActivatedRoute` with parameters specific to each route component.

```ts
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';

@Component({
  template: `{{ id$ | async }}`
})
export class RouteComponent {
   id$: Observable<string>;
   constructor(route: ActivatedRoute) {
     this.id$ = route.params.pluck<string>('id');
   }
}
```

## Query Parameters

@ngrx/router

```ts
import { QueryParams } from '@ngrx/router';
import { Observable } from 'rxjs/Observable';

@Component({
  template: `{{ id$ | async }}`
})
export class RouteComponent {
   id$: Observable<string>;
   constructor(queryParams: QueryParams) {
     this.id$ = queryParams.pluck<string>('id');
   }
}
```

@angular/router has an `ActivatedRoute` with the query parameters global across all routes.

```ts
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';

@Component({
  template: `{{ id$ | async }}`
})
export class RouteComponent {
   id$: Observable<string>;
   constructor(route: ActivatedRoute) {
     this.id$ = route.queryParams.pluck<string>('id');
   }
}
```

### Guards

@ngrx/router

Route configuration

```ts
{ path: 'route', component: RouteComponent, guards: [AuthGuard] }
```

Guard
```ts
import { Injectable } from '@angular/core';
import { Guard, Router } from '@ngrx/router';
import { Http } from '@angular/http';

@Injectable()
class AuthGuard implements Guard {
  constructor(private _http: Http, private _router: Router) { }

  protectRoute(candidate: TraversalCandidate) {
    return this._http.get('/auth/check')
      .map(() => true)
      // If request fails, catch the error and redirect
      .catch(() => {
        this._router.go('/400');

        return Observable.of(false);
      });
  }
}
```

@angular/router

Route configuration

```ts
{ path: 'route', component: RouteComponent, canActivate: [AuthGuard] }
```

Guard
```ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Http } from '@angular/http';

@Injectable()
class AuthGuard implements CanActivate {
  constructor(private _http: Http, private _router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this._http.get('/auth/check')
      .map(() => true)
      // If request fails, catch the error and redirect
      .catch(() => {
        this._router.navigate(['/400']);

        return Observable.of(false);
      });
  }
}
```
