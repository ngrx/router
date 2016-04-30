import {
  describe,
  beforeEach,
  beforeEachProviders,
  it,
  iit,
  async,
  inject
} from '@angular/core/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { provide } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { RouteView } from '../lib/route-view';
import { ComponentRenderer } from '../lib/component-renderer';
import { RouterInstruction, NextInstruction } from '../lib/router-instruction';

class TestRoute {}

class TestRoute2 {}

class MockRenderer {
  render: Function = jasmine.createSpy('_render').and.returnValue(
    Observable.of(jasmine.createSpyObj('ComponentRef', ['destroy']))
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

  it('should not render without a route set', async(inject([TestComponentBuilder], (tcb) => {
    return compile(tcb)
      .then((fixture) => {
        let instance = fixture.componentInstance;

        expect(instance._renderer.render).not.toHaveBeenCalled();
      });
  })));

  it('should not render if missing a route component and component loader', async(inject([TestComponentBuilder, RouterInstruction], (tcb, rs) => {
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
  })));

  it('should render with a component', async(inject([TestComponentBuilder, RouterInstruction], (tcb, rs) => {
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
  })));

  it('should render with a named component', async(inject([TestComponentBuilder, RouterInstruction], (tcb, rs) => {
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
  })));

  it('should render with a component loader', async(inject([TestComponentBuilder, RouterInstruction], (tcb, rs) => {
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
  })));

  it('should destroy the previous component on when the route set changes', async(inject([TestComponentBuilder, RouterInstruction], (tcb, rs) => {
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

        expect(instance._prev.destroy).toHaveBeenCalled();
      });
  })));

  it('should not destroy if the component doesn\'t change when the route set changes', async(inject([TestComponentBuilder, RouterInstruction], (tcb, rs) => {
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


        expect(instance._prev.destroy).not.toHaveBeenCalled();
      });
  })));

  it('should not destroy if the component doesn\'t change when the route set changes with named routes', async(inject([TestComponentBuilder, RouterInstruction], (tcb, rs) => {
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


        expect(instance._prev.destroy).not.toHaveBeenCalled();
      });
  })));

  it('should destroy if the component does change when the route set changes', async(inject([TestComponentBuilder, RouterInstruction], (tcb, rs) => {
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


        expect(instance._prev.destroy).toHaveBeenCalledTimes(1);
      });
  })));

  it('should destroy if the component does change when the route set changes with named routes', async(inject([TestComponentBuilder, RouterInstruction], (tcb, rs) => {
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


        expect(instance._prev.destroy).toHaveBeenCalledTimes(1);
      });
  })));

  it('should destroy the component when destroyed', async(inject([TestComponentBuilder, RouterInstruction], (tcb, rs) => {
    rs.next({
      routeConfigs: [{
        component: TestRoute
      }]
    });

    return compile(tcb)
      .then((fixture) => {
        let instance = fixture.componentInstance;
        instance.ngOnInit();

        let spy = instance._prev.destroy;

        instance.ngOnDestroy();

        expect(spy).toHaveBeenCalled();
      });
  })));
});
