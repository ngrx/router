import {
  Directive,
  HostBinding,
  HostListener,
  Input,
  PLATFORM_DIRECTIVES,
  provide,
  Provider
} from  'angular2/core';
import { Router } from './router';

/**
 * The LinkTo directive links to routes in your app
 *
 * Links are pushed to the `Router` service to trigger a route change.
 * Query params can be represented as an object or a string of names/values
 *
 * <a linkTo="/home/page" [queryParams]="{ id: 123 }">Home Page</a>
 * <a [linkTo]="'/pages' + page.id">Page 1</a>
 */
@Directive({ selector: '[linkTo]' })
export class LinkTo {
  @Input() target: string;
  @HostBinding('attr.href') linkHref;

  @Input() set linkTo(href: string){
    this._href = href;
    this._updateHref();
  }

  @Input() set queryParams(params: string | Object) {
    this._query = params;
    this._updateHref();
  }

  private _href: string;
  private _query: string | Object;

  constructor(private _router: Router) {}

  /**
   * Handles click events on the associated link
   * Prevents default action for non-combination click events without a target
   */
  @HostListener('click', ['$event'])
  onClick(event) {
    if (!this._comboClick(event) && !this.target) {
      this._router.go(this._href, this._query);

      event.preventDefault();
    }
  }

  private _updateHref() {
    this.linkHref = this._router.prepareExternalUrl(this._href, this._query);
  }

  /**
   * Determines whether the click event happened with a combination of other keys
   */
  private _comboClick(event) {
    let buttonEvent = event.which || event.button;

    return (buttonEvent > 1 || event.ctrlKey || event.metaKey || event.shiftKey);
  }
}

export const LINK_TO_PROVIDERS = [
  provide(PLATFORM_DIRECTIVES, {
    multi: true,
    useValue: [ LinkTo ]
  })
];
