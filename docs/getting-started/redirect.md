# Redirect Routes

Continuing from the example in the [Route]('./route.md') guide, imagine if we wanted to change `/blog/:id` to `/post`. Unlike other routers, ngrx/router does not have named routes. Instead, we would change the the path in our route configuration and setup a _Redirect Route_:

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
        redirectTo: '/post:id'
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
