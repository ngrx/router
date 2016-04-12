import {
  describe,
  beforeEach,
  beforeEachProviders,
  it,
  iit,
  TestComponentBuilder,
  injectAsync,
  expect
} from 'angular2/testing';
import {
  Component,
  provide
} from 'angular2/core';
import { LinkTo } from '../lib/link-to';
import { LinkActive } from '../lib/link-active';
import { ROUTER_PROVIDERS, Router } from '../lib/router';
import { SpyLocation } from 'angular2/router/testing';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/subject/BehaviorSubject';
import { LocationStrategy } from 'angular2/src/router/location/location_strategy';
import { MockLocationStrategy } from 'angular2/src/mock/mock_location_strategy';

@Component({
  selector: 'link-active-test',
  template: '',
  directives: [LinkTo, LinkActive]
})
class TestComponent {}

const compile = (tcb: TestComponentBuilder, template: string = '') => {
  return tcb
    .overrideTemplate(TestComponent, template)
    .createAsync(TestComponent);
};

describe('Link Active', () => {
  beforeEachProviders(() => [
    ROUTER_PROVIDERS,
    provide(LocationStrategy, { useClass: MockLocationStrategy })
  ]);

  it('should be defined', () => {
    expect(LinkActive).toBeDefined();
  });

  it('should add the provided class to the active element', injectAsync([TestComponentBuilder, Router], (tcb, router$) => {
    router$.next({
      path: '/page'
    });

    return compile(tcb, '<a linkActive="active" linkTo="/page">Page</a>')
      .then((fixture) => {
        fixture.detectChanges();
        let compiled = fixture.debugElement.nativeElement;
        let link: Element = compiled.querySelector('a');

        expect(link.getAttribute('class')).toEqual('active');
      });
  }));

  it('should support multiple classes on the active element', injectAsync([TestComponentBuilder, Router], (tcb, router$) => {
    router$.next({
      path: '/page'
    });

    return compile(tcb, '<a linkActive="active orange" linkTo="/page">Page</a>')
      .then((fixture) => {
        fixture.detectChanges();
        let compiled = fixture.debugElement.nativeElement;
        let link: Element = compiled.querySelector('a');

        expect(link.getAttribute('class')).toEqual('active orange');
      });
  }));

  it('should add the provided class to a child element', injectAsync([TestComponentBuilder, Router], (tcb, router$) => {
    router$.next({
      path: '/page'
    });

    return compile(tcb, `
        <div linkActive="active">
          <a linkTo="/page">Page</a>
        </div>
      `)
      .then((fixture) => {
        fixture.detectChanges();
        let compiled = fixture.debugElement.nativeElement;
        let parentElement: Element = compiled.querySelector('div');

        expect(parentElement.getAttribute('class')).toEqual('active');
      });
  }));

  it('should add the provided class to a parent element with one active child element', injectAsync([TestComponentBuilder, Router], (tcb, router$) => {
    router$.next({
      path: '/page2'
    });

    return compile(tcb, `
        <div linkActive="active">
          <a linkTo="/page">Page</a><br>
          <a linkTo="/page2">Page</a><br>
          <a linkTo="/page3">Page</a><br>
        </div>
      `)
      .then((fixture) => {
        fixture.detectChanges();
        let compiled = fixture.debugElement.nativeElement;
        let parentElement: Element = compiled.querySelector('div');

        expect(parentElement.getAttribute('class')).toEqual('active');
      });
  }));

  it('should match parent/child elements when using non-exact match', injectAsync([TestComponentBuilder, Router], (tcb, router$) => {
    router$.next({
      path: '/pages/page2'
    });

    return compile(tcb, `
          <a id="pages" linkActive="active" [activeOptions]="{ exact: false }" linkTo="/pages">Pages</a><br>
          <a id="page2" linkActive="active" linkTo="/pages/page2">Page 2</a><br>
      `)
      .then((fixture) => {
        fixture.detectChanges();
        let compiled = fixture.debugElement.nativeElement;
        let pagesLink: Element = compiled.querySelector('#pages');
        let page2Link: Element = compiled.querySelector('#page2');

        expect(pagesLink.getAttribute('class')).toEqual('active');
        expect(page2Link.getAttribute('class')).toEqual('active');
      });
  }));

  it('should only check path for active link', injectAsync([TestComponentBuilder, Router], (tcb, router$) => {
    return compile(tcb, `
          <a linkActive="active" linkTo="/pages/page2" [queryParams]="{ search: 'criteria' }">Page 2</a><br>
      `)
      .then((fixture) => {
        fixture.detectChanges();
        let compiled = fixture.debugElement.nativeElement;
        let link: Element = compiled.querySelector('a');

        router$.next({
          path: '/pages/page2'
        });

        fixture.detectChanges();
        expect(link.getAttribute('href')).toEqual('/pages/page2?search=criteria');
        expect(link.getAttribute('class')).toEqual('active');
      });
  }));
});
