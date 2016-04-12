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
import { Component, provide, ViewChild } from 'angular2/core';
import { LinkTo } from '../lib/link-to';
import { ROUTER_PROVIDERS, Router } from '../lib/router';
import { Observable } from 'rxjs/Observable';
import { LocationStrategy } from 'angular2/src/router/location/location_strategy';
import { MockLocationStrategy } from 'angular2/src/mock/mock_location_strategy';

@Component({
  selector: 'link-test',
  template: '',
  directives: [LinkTo]
})
class TestComponent {
  @ViewChild(LinkTo) link: LinkTo;
}

const compile = (tcb: TestComponentBuilder, template: string = '') => {
  return tcb
    .overrideTemplate(TestComponent, template)
    .createAsync(TestComponent);
};

describe('Link To', () => {
  beforeEachProviders(() => [
    ROUTER_PROVIDERS,
    provide(LocationStrategy, { useClass: MockLocationStrategy })
  ]);

  it('should be defined', () => {
    expect(LinkTo).toBeDefined();
  });

  it('should generate an href', injectAsync([TestComponentBuilder], (tcb) => {
    return compile(tcb, '<a linkTo="/page">Page</a>')
      .then((fixture) => {
        fixture.detectChanges();
        let compiled = fixture.debugElement.nativeElement;
        let link: Element = compiled.querySelector('a');

        expect(link.getAttribute('href')).toEqual('/page');
      });
  }));

  it('should generate an href with a provided query params object', injectAsync([TestComponentBuilder], (tcb) => {
    return compile(tcb, '<a linkTo="/page" [queryParams]="{id: 1}">Page</a>')
      .then((fixture) => {
        fixture.detectChanges();
        let compiled = fixture.debugElement.nativeElement;
        let link: Element = compiled.querySelector('a');

        expect(link.getAttribute('href')).toEqual('/page?id=1');
      });
  }));

  it('should generate an href with a provided query params string', injectAsync([TestComponentBuilder], (tcb) => {
    return compile(tcb, '<a linkTo="/page" queryParams="id=1">Page</a>')
      .then((fixture) => {
        fixture.detectChanges();
        let compiled = fixture.debugElement.nativeElement;
        let link: Element = compiled.querySelector('a');

        expect(link.getAttribute('href')).toEqual('/page?id=1');
      });
  }));

  describe('When Clicked', () => {
    it('should go to the provided URL', injectAsync([TestComponentBuilder, Router], (tcb, router) => {
      let linkHref = '/page';
      let queryParams = '{id: 1}';

      return compile(tcb, '<a linkTo="' + linkHref + '" queryParams="' + queryParams + '">Page</a>')
        .then((fixture) => {
          fixture.detectChanges();
          let compiled = fixture.debugElement.nativeElement;
          let link = compiled.querySelector('a');

          spyOn(router, 'go');

          link.click();

          expect(router.go).toHaveBeenCalledWith(linkHref, queryParams);
        });
    }));

    it('should not prevent default behavior with a provided target', injectAsync([TestComponentBuilder, Router], (tcb, router) => {
      let linkHref = '/page';
      let queryParams = 'id=1';

      return compile(tcb, '<a linkTo="' + linkHref + '" queryParams="' + queryParams + '" target="_blank">Page</a>')
        .then((fixture) => {
          fixture.detectChanges();
          let compiled = fixture.debugElement.nativeElement;
          let link = compiled.querySelector('a');

          spyOn(router, 'go');

          let instance = fixture.componentInstance.link;
          let event = { button: 1 };
          instance.onClick(event);

          expect(router.go).not.toHaveBeenCalled();
        });
    }));

    it('should not prevent default behavior with a combo click', injectAsync([TestComponentBuilder, Router], (tcb, router) => {
      let linkHref = '/page';
      let queryParams = 'id=1';

      return compile(tcb, '<a linkTo="' + linkHref + '" queryParams="' + queryParams + '">Page</a>')
        .then((fixture) => {
          fixture.detectChanges();
          let compiled = fixture.debugElement.nativeElement;
          let link: Element = compiled.querySelector('a');
          fixture.detectChanges();

          let instance = fixture.componentInstance.link;

          spyOn(router, 'go');

          let events = [
            { which: 1, ctrlKey: true },
            { which: 1, metaKey: true },
            { which: 1, shiftKey: true },
            { which: 2 },
            { button: 2 },
            { ctrlKey: true },
            { metaKey: true },
            { shiftKey: true }
          ];

          events.forEach((event) => {
            instance.onClick(event);
          });

          expect(router.go.calls.count()).toEqual(0);
        });
    }));
  });
});
