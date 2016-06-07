import {
  describe,
  beforeEach,
  beforeEachProviders,
  it,
  iit,
  async,
  inject,
  expect
} from '@angular/core/testing';
import { MockLocationStrategy, SpyLocation } from '@angular/common/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { Component, provide } from '@angular/core';
import { LocationStrategy } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { LinkTo } from '../lib/link-to';
import { LinkActive, LINK_ACTIVE_OPTIONS } from '../lib/link-active';
import { ROUTER_PROVIDERS, Router } from '../lib/router';

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

  it('should add the provided class to the active element', async(inject([TestComponentBuilder, Router], (tcb, router$) => {
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
  })));

  it('should add a default class to the active element if not provided', async(inject([TestComponentBuilder, Router], (tcb, router$) => {
    router$.next({
      path: '/page'
    });

    return compile(tcb, '<a [linkActive] linkTo="/page">Page</a>')
      .then((fixture) => {
        fixture.detectChanges();
        let compiled = fixture.debugElement.nativeElement;
        let link: Element = compiled.querySelector('a');

        fixture.detectChanges();
        expect(link.getAttribute('class')).toEqual('active');
      });
  })));

  it('should support multiple classes on the active element', async(inject([TestComponentBuilder, Router], (tcb, router$) => {
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
  })));

  it('should add the provided class to a child element', async(inject([TestComponentBuilder, Router], (tcb, router$) => {
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
  })));

  it('should add the provided class to a parent element with one active child element', async(inject([TestComponentBuilder, Router], (tcb, router$) => {
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
  })));

  it('should match parent/child elements when using non-exact match', async(inject([TestComponentBuilder, Router], (tcb, router$) => {
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
  })));

  it('should only check path for active link', async(inject([TestComponentBuilder, Router], (tcb, router$) => {
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
  })));

  describe('With Hash', () => {
    it('should add the provided class to the active element', async(inject([TestComponentBuilder, Router, LocationStrategy], (tcb, router$, ls) => {
      ls.internalBaseHref = '#';

      router$.next({
        path: '/'
      });

      return compile(tcb, '<a linkActive="active" linkTo="/">Page</a>')
        .then((fixture) => {
          fixture.detectChanges();
          let compiled = fixture.debugElement.nativeElement;
          let link: Element = compiled.querySelector('a');

          expect(link.getAttribute('class')).toEqual('active');
        });
    })));
  });

  describe('With Default Link Active Options', () => {
    beforeEachProviders(() => [
      ROUTER_PROVIDERS,
      provide(LocationStrategy, { useClass: MockLocationStrategy }),
      provide(LINK_ACTIVE_OPTIONS, { useValue: { exact: false } })
    ]);

    it('should allow override of default LinkActiveOptions', async(inject([TestComponentBuilder, Router], (tcb, router$) => {
      router$.next({
        path: '/pages/page2'
      });

      return compile(tcb, `
            <a id="pages" linkActive="active" linkTo="/pages">Pages</a><br>
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
    })));

    it('should allow local override of default LinkActiveOptions', async(inject([TestComponentBuilder, Router], (tcb, router$) => {
      router$.next({
        path: '/pages/page2'
      });

      return compile(tcb, `
            <a id="pages" linkActive="active" linkTo="/pages" [activeOptions]="{ exact: true }">Pages</a><br>
            <a id="page2" linkActive="active" linkTo="/pages/page2">Page 2</a><br>
        `)
        .then((fixture) => {
          fixture.detectChanges();
          let compiled = fixture.debugElement.nativeElement;
          let pagesLink: Element = compiled.querySelector('#pages');
          let page2Link: Element = compiled.querySelector('#page2');

          expect(pagesLink.getAttribute('class')).not.toEqual('active');
          expect(page2Link.getAttribute('class')).toEqual('active');
        });
    })));
  });
});
