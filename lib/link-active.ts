import {Directive, Input, Query, QueryList, Renderer, ElementRef, AfterViewInit, OnDestroy} from 'angular2/core';
import { LinkTo } from './link-to';
import { Location } from './location';

export interface ActiveOptions {
  exact: boolean;
}

/**
 * The LinkActive directive toggles classes on elements that contain an active linkTo directive
 *
 * <a linkActive="active" linkTo="/home/page">Home Page</a>
 * <ol>
 *  <li linkActive="active" *ngFor="var link of links">
 *    <a [linkTo]="'/link/' + link.id">{{ link.title }}</a>
 *  </li>
 * </ol>
 */
 @Directive({ selector: '[linkActive]' })
 export class LinkActive implements AfterViewInit, OnDestroy {
   @Input('linkActive') activeClass: string;
   @Input() activeOptions: ActiveOptions = { exact: true };
   private _sub: any;

   constructor(
     @Query(LinkTo) public links:QueryList<LinkTo>,
     public element: ElementRef,
     public location$: Location,
     public renderer: Renderer
   ) {}

   ngAfterViewInit() {
     this._sub = this.location$
     .map(({path}) => this.location$.prepareExternalUrl(path))
     .subscribe(path => {
       this.checkActive(path);
     });
   }

   checkActive(path) {
    let active = this.links.reduce((active, current) => {
      let [href, query] = current.linkHref.split('?');

       if (this.activeOptions.exact) {
         return active ? active : href === path;
       } else {
         return active ? active : path.startsWith(href);
       }
     }, false);

     let activeClasses = this.activeClass.split(' ');
     activeClasses.forEach((activeClass) => {
       this.renderer.setElementClass(this.element.nativeElement, activeClass, active);
     });
   }

   ngOnDestroy() {
     if (this._sub) {
       this._sub.unsubscribe();
     }
   }
 }
