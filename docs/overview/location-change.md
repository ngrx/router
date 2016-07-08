# Listening for location change
The Router exposes location changes using observable services.

```ts
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Inject } from '@angular/core';
import { Router, LocationChange, LOCATION_CHANGES } from '@ngrx/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  ...
})
export class Page implements OnInit {
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    @Inject(LOCATION_CHANGES) private locationChanges: Observable<LocationChange>) {}

  ngOnInit() {
    this.locationChanges.subscribe(locationChange => {
        this.changeDetectorRef.markForCheck();
    });
  }
}
```