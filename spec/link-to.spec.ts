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
  Component
} from 'angular2/core';
import { LinkTo } from '../lib/link-to';
import { LOCATION_PROVIDERS, Location } from '../lib/location';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'link-test',
  template: '',
  directives: [LinkTo]
})
class TestComponent{}

const compile = (tcb: TestComponentBuilder, template: string = '') => {
  return tcb
    .overrideTemplate(TestComponent, template)
    .createAsync(TestComponent);
};

describe('Link To', () => {
  beforeEachProviders(() => [
    LOCATION_PROVIDERS
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
    it('should go to the provided URL', injectAsync([TestComponentBuilder, Location], (tcb, location) => {
      let linkHref = "/page";
      let queryParams = "{id: 1}";

      return compile(tcb, '<a linkTo="' + linkHref + '" queryParams="' + queryParams + '">Page</a>')
        .then((fixture) => {
          fixture.detectChanges();
          let compiled = fixture.debugElement.nativeElement;
          let link = compiled.querySelector('a');

          spyOn(location, 'go');

          link.click();

          expect(location.go).toHaveBeenCalledWith(linkHref, queryParams);
        });
    }));

    it('should not prevent default behavior with a provided target', injectAsync([TestComponentBuilder, Location], (tcb, location) => {
      let linkHref = "/page";
      let queryParams = "id=1";

      return compile(tcb, '<a linkTo="' + linkHref + '" queryParams="' + queryParams + '" target="_blank">Page</a>')
        .then((fixture) => {
          fixture.detectChanges();
          let compiled = fixture.debugElement.nativeElement;
          let link = compiled.querySelector('a');

          spyOn(location, 'go');

          link.click();

          expect(location.go).not.toHaveBeenCalled();
        });
    }));

    it('should not prevent default behavior with a combo click', injectAsync([TestComponentBuilder, Location], (tcb, location) => {
      let linkHref = "/page";
      let queryParams = "id=1";

      return compile(tcb, '<a linkTo="' + linkHref + '" queryParams="' + queryParams + '">Page</a>')
        .then((fixture) => {
          fixture.detectChanges();
          let compiled = fixture.debugElement.nativeElement;
          let link: Element = compiled.querySelector('a');

          spyOn(location, 'go');

          let event = new MouseEvent('click', { metaKey: true });

          compiled.dispatchEvent(event, link);

          expect(location.go).not.toHaveBeenCalled();
        });
    }));
  });
});
