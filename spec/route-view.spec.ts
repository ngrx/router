import {
  describe,
  beforeEach,
  beforeEachProviders,
  it,
  iit,
  TestComponentBuilder,
  injectAsync
} from 'angular2/testing';
import {
  provide
} from 'angular2/core';
import { RouteView } from '../lib/route-view';
import { ComponentRenderer } from '../lib/component-renderer';
import { Observable } from 'rxjs/Observable';
import { RouteSet, NextRoute } from '../lib/route-set';
import { BehaviorSubject } from 'rxjs/subject/BehaviorSubject';

class TestRoute{}

class TestRoute2{}

class MockRenderer{
  render: Function = jasmine.createSpy('_render').and.returnValue(Observable.of(jasmine.createSpyObj('ComponentRef', ['dispose'])));
}

class MockRouteSet extends BehaviorSubject<NextRoute> {}

const compile = (tcb: TestComponentBuilder) => {
  return tcb
    .overrideProviders(RouteView, [
      provide(ComponentRenderer, {useClass: MockRenderer})
    ])
    .createAsync(RouteView)
};

describe('Route View', () => {
  it('should be defined', () => {
    expect(RouteView).toBeDefined();
  });

  beforeEachProviders(() => [
    provide(RouteSet, {useClass: MockRouteSet})
  ]);

  it('should not render without a route set', injectAsync([TestComponentBuilder], (tcb) => {
    return compile(tcb)
      .then((fixture) => {
        let instance = fixture.componentInstance;

        expect(instance._renderer.render).not.toHaveBeenCalled();
      });
  }));

  it('should not render if missing a route component and component loader', injectAsync([TestComponentBuilder, RouteSet], (tcb, rs) => {
    rs.next({
      url: '/url',
      routes: [{
        component: undefined,
        loadComponent: undefined
      }],
      params: {}
    });

    return compile(tcb)
      .then((fixture) => {
        let instance = fixture.componentInstance;
        instance.ngOnInit();

        expect(instance._renderer.render).not.toHaveBeenCalled();
      });
  }));

  it('should render with a component', injectAsync([TestComponentBuilder, RouteSet], (tcb, rs) => {
    rs.next({
      url: '/url',
      routes: [{
        component: TestRoute
      }],
      params: {}
    });

    return compile(tcb)
      .then((fixture) => {
        let instance = fixture.componentInstance;
        instance.ngOnInit();

        expect(instance._renderer.render).toHaveBeenCalled();
      });
  }));

  it('should render with a component loader', injectAsync([TestComponentBuilder, RouteSet], (tcb, rs) => {
    rs.next({
      routes: [{
        loadComponent: () => TestRoute
      }]
    });

    return compile(tcb)
      .then((fixture) => {
        let instance = fixture.componentInstance;
        instance.ngOnInit();

        expect(instance._renderer.render).toHaveBeenCalled();
      });
  }));

  it('should dispose the previous component on when the route set changes', injectAsync([TestComponentBuilder, RouteSet], (tcb, rs) => {
    rs.next({
      routes: [{
        component: TestRoute
      }]
    });

    return compile(tcb)
      .then((fixture) => {
        let instance = fixture.componentInstance;
        instance.ngOnInit();

        rs.next({
          routes: [{
            loadComponent: () => TestRoute2
          }]
        });

        instance.ngOnInit();

        expect(instance._prev.dispose).toHaveBeenCalled();
      });
  }));

  it('should not dispose if the component doesn\'t change when the route set changes', injectAsync([TestComponentBuilder, RouteSet], (tcb, rs) => {
    rs.next({
      routes: [{
        component: TestRoute
      }]
    });

    return compile(tcb)
      .then((fixture) => {
        let instance = fixture.componentInstance;
        instance.ngOnInit();

        rs.next({
          routes: [{
            component: TestRoute
          }]
        });

        expect(instance._prev.dispose.calls.count()).toEqual(1);
      });
  }));

  it('should dispose the component when destroyed', injectAsync([TestComponentBuilder, RouteSet], (tcb, rs) => {
    rs.next({
      routes: [{
        component: TestRoute
      }]
    });

    return compile(tcb)
      .then((fixture) => {
        let instance = fixture.componentInstance;
        instance.ngOnInit();

        let spy = instance._prev.dispose;

        instance.ngOnDestroy();

        expect(spy).toHaveBeenCalled();
      });
  }));
});
