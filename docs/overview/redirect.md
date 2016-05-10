# Redirect Routes

Continuing from the example in the [Route](route.md) guide, imagine if we wanted to change `/blog/:id` to `/post`. Unlike other routers, ngrx/router does not have named routes. Instead, we would change the the path in our route configuration and setup a _Redirect Route_:

```ts
const routes: Routes = [
  {
    path: '/',
    component: HomePage
  },
  {
    path: '/blog',
    component: BlogPage,
    children: [
      {
        path: ':id',
        redirectTo: '/post/:id'
      }
    ]
  },
  {
    path: '/post/:id',
    component: PostPage
  }
]
```

Now when a user navigates to `/blog/:id` they are automatically redirected to `/post/:id`. No more broken links!


### Index Redirects
If you want to redirect only if the path matches a specific route, you can use an index redirect:

```ts
const routes: Routes = [
  {
    path: '/users',
    component: UsersComponent,
    index: {
      redirectTo: '/'
    },
    children: [
      {
        path: ':id',
        component: UserByIdComponent
      }
    ]
  }
];
```

Now if a user goes to `/users` they will be redirected home but they can still navigate to `/users/:id` safely.


### Relative Redirects
You can also redirect relatively. This is handy for deeply nested links:

```ts
const routes: Routes = [
  {
    path: '/blog',
    component: BlogComponent,
    children: [
      {
        path: ':id',
        component: PostComponent,
        children: [
          {
            path: 'change',
            redirectTo: 'edit'
          },
          {
            path: 'edit',
            component: EditPostComponent
          }
        ]
      }
    ]
  }
];
```

If a user navigates to `/blog/123/change` they will be redirected to `/blog/123/edit`.
