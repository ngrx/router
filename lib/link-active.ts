import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  Query,
  QueryList,
  Renderer,
  Optional,
  OpaqueToken,
  Inject
} from '@angular/core';
import { LinkTo } from './link-to';
import { Router } from './router';

export interface LinkActiveOptions {
  exact: boolean;
}

export const LINK_ACTIVE_OPTIONS: LinkActiveOptions = {
  exact: true
};

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
   @Input('linkActive') activeClass: string = 'active';
   @Input() activeOptions: LinkActiveOptions;
   private _sub: any;
   private _activeOptions: LinkActiveOptions = { exact: true };

   constructor(
     @Query(LinkTo) public links: QueryList<LinkTo>,
     public element: ElementRef,
     public router$: Router,
     public renderer: Renderer,
     @Optional()
     @Inject(LINK_ACTIVE_OPTIONS)
      private defaultActiveOptions: LinkActiveOptions
   ) {}

   ngAfterViewInit() {
     if (this.defaultActiveOptions && !this.activeOptions) {
       this._activeOptions = this.defaultActiveOptions;
     } else if (this.activeOptions) {
       this._activeOptions = this.activeOptions;
     }

     this._sub = this.router$
     .map(({path}) => this.router$.prepareExternalUrl(path || '/'))
     .subscribe(path => {
       this.checkActive(path);
     });
   }

   checkActive(path) {
    let active = this.links.reduce((active, current) => {
      let [href, query] = current.linkHref.split('?');

      if (this._activeOptions.exact) {
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

   subscribeLinks() {
     let newList: any[] = [];
     for (let i = 0; i < this.links.length; i++) {
       let link: LinkTo = this.links.toArray()[i];
       let linkSub = this.findLinkSubscription(link);
       if (linkSub !== null) {
         this._linksSubscribed.splice(this._linksSubscribed.indexOf(linkSub), 1);
       }
       else {
         linkSub = {
           link: link,
           subscription: link.hrefUpdated.subscribe(_ => this.checkActive(this.router$.prepareExternalUrl(this.router$.path() || '/')))
         };
       }
       newList.push(linkSub);
     }

     for (let i = 0; i < this._linksSubscribed.length; i++) {
       this._linksSubscribed[i].subscription.unsubscribe();
     }

     this._linksSubscribed = newList;
   }

   findLinkSubscription (link: LinkTo) {
     for (let i = 0; i < this._linksSubscribed.length; i++) {
       if (this._linksSubscribed[i].link === link) {
         return this._linksSubscribed[i];
       }
     }

     return null;
   }

   ngOnDestroy() {
     if (this._sub) {
       this._sub.unsubscribe();
     }
     for (let i = 0; i < this._linksSubscribed.length; i++) {
       this._linksSubscribed[i].subscription.unsubscribe();
     }
   }
 }
