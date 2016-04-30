import 'rxjs/add/operator/toPromise';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { ReflectiveInjector, provide, DynamicComponentLoader, ViewContainerRef } from 'angular2/core';

import { RESOURCE_LOADER_PROVIDERS } from '../lib/resource-loader';

import {
  ComponentRenderer,
  PRE_RENDER_HOOKS,
  POST_RENDER_HOOKS
} from '../lib/component-renderer';
import { Route, BaseRoute } from '../lib/route';
import { Hook } from '../lib/hooks';

class MockDCL {
  loadNextToLocation: Function = jasmine.createSpy('loadNextToLocation').and
    .returnValue(Observable.of(true).toPromise());
}

class TestComponent {}

describe('Component Renderer', function() {
  let route: Route,
      components: BaseRoute,
      renderer: ComponentRenderer,
      injector: ReflectiveInjector,
      loader: any;

  describe('when rendering', () => {
    let route;
    let viewContainerRef = {};
    let providers = [];

    beforeEach(() => {
      injector = ReflectiveInjector.resolveAndCreate([
        ComponentRenderer,
        provide(DynamicComponentLoader, {useClass: MockDCL}),
        RESOURCE_LOADER_PROVIDERS
      ]);

      renderer = injector.get(ComponentRenderer);
      loader = injector.get(DynamicComponentLoader);
    });

    it('should render a component', (done) => {
      route = {};
      components = { component: TestComponent };

      let render = renderer.render(route, components, injector, <ViewContainerRef>viewContainerRef, loader, providers);

      render.subscribe(() => {
        expect(loader.loadNextToLocation).toHaveBeenCalledWith(TestComponent, viewContainerRef, providers);
        done();
      });
    });

    it('should render a loaded component', (done) => {
      route = { };
      components = {
        loadComponent: () => Promise.resolve(TestComponent)
      };

      let render = renderer.render(route, components, injector, <ViewContainerRef>viewContainerRef, loader, providers);

      render.subscribe(() => {
        expect(loader.loadNextToLocation).toHaveBeenCalledWith(TestComponent, viewContainerRef, providers);
        done();
      });
    });
  });

  xdescribe('Pre Middleware', () => {
    let route: Route = { component: TestComponent };
    let providers = [];
    let viewContainerRef = {};
    let renderHookProviders = [
      provide('test', {useValue: 'tester'})
    ];
    let renderHookSpy = jasmine.createSpy('middleware');
    let renderHook: Hook<any>;
    let render;

    beforeEach(() => {
      renderHook = {
        apply(instruction$) {
          return instruction$.map(ins => {
            renderHookSpy();

            return {
              component: 'newComponent',
              injector: injector,
              provider: renderHookProviders
            };
          });
        }
      };

      injector = ReflectiveInjector.resolveAndCreate([
        ComponentRenderer,
        provide(PRE_RENDER_HOOKS, { useValue: renderHook, multi: true }),
        provide(DynamicComponentLoader, {useClass: MockDCL}),
        RESOURCE_LOADER_PROVIDERS
      ]);

      renderer = injector.get(ComponentRenderer);
      loader = injector.get(DynamicComponentLoader);
    });

    beforeEach(() => {
      render = renderer.render(route, route, injector, <ViewContainerRef>viewContainerRef, loader, providers);
    });

    it('should execute before rendering', (done) => {
      render.subscribe(() => {
        expect(renderHookSpy).toHaveBeenCalled();
        expect(loader.loadNextToLocation).toHaveBeenCalled();
        done();
      });
    });

    it('can modify the providers', (done) => {
      render.subscribe(() => {
        expect(loader.loadNextToLocation).toHaveBeenCalled();
        expect(loader.loadNextToLocation.calls.mostRecent().args[2]).not.toEqual(providers);
        done();
      });
    });

    it('can modify the component', (done) => {
      render.subscribe(() => {
        expect(loader.loadNextToLocation).toHaveBeenCalled();
        expect(loader.loadNextToLocation.calls.mostRecent().args[0]).toEqual('newComponent');
        done();
      });
    });
  });

  xdescribe('Post Middleware', () => {
    let route: Route = { component: TestComponent };
    let providers = [];
    let viewContainerRef = {};
    let renderHookSpy = jasmine.createSpy('middleware');
    let renderHook: Hook<any>;
    let render;

    beforeEach(() => {
      renderHook = {
        apply(componentRef$) {
          return componentRef$.map(ref => {
            renderHookSpy();

            return false;
          });
        }
      };

      injector = ReflectiveInjector.resolveAndCreate([
        ComponentRenderer,
        provide(POST_RENDER_HOOKS, { useValue: renderHook, multi: true }),
        provide(DynamicComponentLoader, {useClass: MockDCL}),
        RESOURCE_LOADER_PROVIDERS
      ]);

      renderer = injector.get(ComponentRenderer);
      loader = injector.get(DynamicComponentLoader);
    });

    beforeEach(() => {
      render = renderer.render(route, route, injector, <ViewContainerRef>viewContainerRef, loader, providers);
    });

    it('should execute after rendering', (done) => {
      render.subscribe(() => {
        expect(loader.loadNextToLocation).toHaveBeenCalled();
        expect(renderHookSpy).toHaveBeenCalled();
        done();
      });
    });

    it('can modify the component ref', (done) => {
      render.subscribe((componentRef) => {
        expect(loader.loadNextToLocation).toHaveBeenCalled();
        expect(componentRef).toEqual(false);
        done();
      });
    });
  });
});
