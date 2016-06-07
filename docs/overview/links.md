# Route Links

## Links

In order to link between routes, use the `linkTo` directive along with the full path of the route.

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app',
  template: `
    <h1>My Blog</h1>
    <nav>
      <a linkTo="/">Home</a>
      <a [linkTo]="blogPagesPath">Blog Pages</a>
      <a linkTo="/blog/search" [queryParams]="{ query: 'Angular'}">Angular Blog Posts</a>
    </nav>
  `
})
class App {
  public blogPagesPath: string = '/blog/pages';
}
```

## Active links

To toggle classes on elements, use the `linkActive` directive and a space-delimited list of classes. The provided classes will be toggled when the route is active/inactive.

**NOTE: Only the path is used for checking whether the link is active. Query parameters are ignored.**

```html
<a linkActive="active red" linkTo="/">Home</a>
<a [linkActive]="'active blue'" linkTo="/blog">Blog</a>
```

You can also toggle classes on parent elements with the `linkActive` directive.

```html
<ul>
 <li linkActive="active" *ngFor="var link of links">
   <a [linkTo]="'/link/' + link.id">{{ link.title }}</a>
 </li>
</ul>
```

## Active parent links

In order to keep a parent link active when the child path is active, use the `activeOptions` input and the `exact` property along with the `linkActive` directive. The `exact` property will mark the parent link as active if the current path starts with the parent link path.

```html
<nav>
  <a linkActive="active red" [activeOptions]="{ exact: false }" linkTo="/blogs">Blog</a>
</nav>

<subnav>
  <a linkActive="active red" linkTo="/blogs/pages/1">Page 1</a>
</subnav>
```

## Default Link Active Options

To override the default `activeOptions` for the `linkActive` directive, provide the `LINK_ACTIVE_OPTIONS` token in the bootstrap array of the application.

```ts
import {LINK_ACTIVE_OPTIONS} from '@ngrx/router';

bootstrap(App, [
  provide(LINK_ACTIVE_OPTIONS, { useValue: { exact: false } })
])
```
