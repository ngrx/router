# Listening for location change
The Router exposes location changes using observable services.

```ts
import { Component, OnInit, Inject } from '@angular/core';
import { LocationChange, LOCATION_CHANGES } from '@ngrx/router';

@Component({...})
export class Page implements OnInit {
  constructor(
    @Inject(LOCATION_CHANGES) private locationChanges: Observable<LocationChange>) {}

  ngOnInit() {
    this.locationChanges.subscribe(locationChange => {
        ...
    });
  }
}
```