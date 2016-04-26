import 'rxjs/add/operator/toPromise';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { ReflectiveInjector, provide, DynamicComponentLoader, ViewContainerRef } from 'angular2/core';

import { RESOURCE_LOADER_PROVIDERS } from '../lib/resource-loader';

import {
  ComponentRenderer,
  usePreRenderMiddleware,
  usePostRenderMiddleware
} from '../lib/component-renderer';
import { Route, BaseRoute } from '../lib/route';
import { createMiddleware, identity } from '../lib/middleware';

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
        usePreRenderMiddleware(identity),
        usePostRenderMiddleware(identity),
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

  describe('Pre Middleware', () => {
    let route: Route = { component: TestComponent };
    let providers = [];
    let viewContainerRef = {};
    let middlewareProviders = [
      provide('test', {useValue: 'tester'})
    ];
    let middlewareSpy = jasmine.createSpy('middleware');
    let renderMiddleware;
    let render;

    beforeEach(() => {
      renderMiddleware = createMiddleware(function(instruction$) {
        return (instruction$) => instruction$.map((ins) => {
          middlewareSpy();

          return {
            component: 'newComponent',
            injector: injector,
            providers: middlewareProviders
          };
        });
      }, []);

      injector = ReflectiveInjector.resolveAndCreate([
        ComponentRenderer,
        usePreRenderMiddleware(renderMiddleware),
        usePostRenderMiddleware(identity),
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
        expect(middlewareSpy).toHaveBeenCalled();
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

  describe('Post Middleware', () => {
    let route: Route = { component: TestComponent };
    let providers = [];
    let viewContainerRef = {};
    let middlewareSpy = jasmine.createSpy('middleware');
    let renderMiddleware;
    let render;

    beforeEach(() => {
      renderMiddleware = createMiddleware(function(instruction$) {
        return (componentRef$) => componentRef$.map((componentRef) => {
          middlewareSpy();

          return false;
        });
      }, []);

      injector = ReflectiveInjector.resolveAndCreate([
        ComponentRenderer,
        usePreRenderMiddleware(identity),
        usePostRenderMiddleware(renderMiddleware),
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
        expect(middlewareSpy).toHaveBeenCalled();
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
