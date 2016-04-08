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
import { BehaviorSubject } from 'rxjs/subject/BehaviorSubject';

import { RouteView } from '../lib/route-view';
import { ComponentRenderer } from '../lib/component-renderer';
import { Observable } from 'rxjs/Observable';
import { RouterInstruction, NextInstruction } from '../lib/router-instruction';

class TestRoute {}

class TestRoute2 {}

class MockRenderer {
  render: Function = jasmine.createSpy('_render').and.returnValue(
    Observable.of(jasmine.createSpyObj('ComponentRef', ['dispose']))
  );
}

class MockRouterInstruction extends BehaviorSubject<NextInstruction> {}

const compile = (tcb: TestComponentBuilder) => {
  return tcb
    .overrideProviders(RouteView, [
      provide(ComponentRenderer, {useClass: MockRenderer})
    ])
    .createAsync(RouteView);
};

describe('Route View', () => {
  it('should be defined', () => {
    expect(RouteView).toBeDefined();
  });

  beforeEachProviders(() => [
    provide(RouterInstruction, {useClass: MockRouterInstruction})
  ]);

  it('should not render without a route set', injectAsync([TestComponentBuilder], (tcb) => {
    return compile(tcb)
      .then((fixture) => {
        let instance = fixture.componentInstance;

        expect(instance._renderer.render).not.toHaveBeenCalled();
      });
  }));

  it('should not render if missing a route component and component loader', injectAsync([TestComponentBuilder, RouterInstruction], (tcb, rs) => {
    rs.next({
      routeConfigs: [{
        component: undefined,
        loadComponent: undefined
      }]
    });

    return compile(tcb)
      .then((fixture) => {
        let instance = fixture.componentInstance;
        instance.ngOnInit();

        expect(instance._renderer.render).not.toHaveBeenCalled();
      });
  }));

  it('should render with a component', injectAsync([TestComponentBuilder, RouterInstruction], (tcb, rs) => {
    rs.next({
      routeConfigs: [{
        component: TestRoute
      }]
    });

    return compile(tcb)
      .then((fixture) => {
        let instance = fixture.componentInstance;
        instance.ngOnInit();

        expect(instance._renderer.render).toHaveBeenCalled();
      });
  }));

  it('should render with a named component', injectAsync([TestComponentBuilder, RouterInstruction], (tcb, rs) => {
    rs.next({
      routeConfigs: [{
        components: {
          main: TestRoute
        }
      }]
    });

    return compile(tcb)
      .then((fixture) => {
        let instance = fixture.componentInstance;
        instance._name = 'main';
        instance.ngOnInit();

        expect(instance._renderer.render).toHaveBeenCalled();
      });
  }));

  it('should render with a component loader', injectAsync([TestComponentBuilder, RouterInstruction], (tcb, rs) => {
    rs.next({
      routeConfigs: [{
        loadComponent: () => Promise.resolve(TestRoute)
      }]
    });

    return compile(tcb)
      .then((fixture) => {
        let instance = fixture.componentInstance;
        instance.ngOnInit();

        expect(instance._renderer.render).toHaveBeenCalled();
      });
  }));

  it('should dispose the previous component on when the route set changes', injectAsync([TestComponentBuilder, RouterInstruction], (tcb, rs) => {
    rs.next({
      routeConfigs: [{
        component: TestRoute
      }]
    });

    return compile(tcb)
      .then((fixture) => {
        let instance = fixture.componentInstance;
        instance.ngOnInit();

        rs.next({
          routeConfigs: [{
            loadComponent: () => TestRoute2
          }]
        });

        instance.ngOnInit();

        expect(instance._prev.dispose).toHaveBeenCalled();
      });
  }));

  it('should not dispose if the component doesn\'t change when the route set changes', injectAsync([TestComponentBuilder, RouterInstruction], (tcb, rs) => {
    rs.next({
      routeConfigs: [{
        component: TestRoute
      }]
    });

    return compile(tcb)
      .then((fixture) => {
        let instance = fixture.componentInstance;
        instance.ngOnInit();

        rs.next({
          routeConfigs: [{
            component: TestRoute
          }]
        });


        expect(instance._prev.dispose).not.toHaveBeenCalled();
      });
  }));

  it('should not dispose if the component doesn\'t change when the route set changes with named routes', injectAsync([TestComponentBuilder, RouterInstruction], (tcb, rs) => {
    rs.next({
      routeConfigs: [{
        components: {
          test: TestRoute
        }
      }]
    });

    return compile(tcb)
      .then((fixture) => {
        let instance = fixture.componentInstance;
        instance._name = 'test';
        instance.ngOnInit();

        rs.next({
          routeConfigs: [{
            components: {
              test: TestRoute
            }
          }]
        });


        expect(instance._prev.dispose).not.toHaveBeenCalled();
      });
  }));

  it('should dispose if the component does change when the route set changes', injectAsync([TestComponentBuilder, RouterInstruction], (tcb, rs) => {
    rs.next({
      routeConfigs: [{
        component: TestRoute
      }]
    });

    return compile(tcb)
      .then((fixture) => {
        let instance = fixture.componentInstance;
        instance.ngOnInit();

        rs.next({
          routeConfigs: [{
            component: TestRoute2
          }]
        });


        expect(instance._prev.dispose).toHaveBeenCalledTimes(1);
      });
  }));

  it('should dispose if the component does change when the route set changes with named routes', injectAsync([TestComponentBuilder, RouterInstruction], (tcb, rs) => {
    rs.next({
      routeConfigs: [{
        components: {
          main: TestRoute
        }
      }]
    });

    return compile(tcb)
      .then((fixture) => {
        let instance = fixture.componentInstance;
        instance._name = 'main';
        instance.ngOnInit();

        rs.next({
          routeConfigs: [{
            components: {
              main: TestRoute2
            }
          }]
        });


        expect(instance._prev.dispose).toHaveBeenCalledTimes(1);
      });
  }));

  it('should dispose the component when destroyed', injectAsync([TestComponentBuilder, RouterInstruction], (tcb, rs) => {
    rs.next({
      routeConfigs: [{
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
