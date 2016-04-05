import 'rxjs/add/operator/toPromise';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Injector, provide, DynamicComponentLoader, ElementRef } from 'angular2/core';

import { RESOURCE_LOADER_PROVIDERS } from '../lib/resource-loader';
import { Location } from '../lib/location';
import {
  ComponentRenderer,
  PRE_RENDER_MIDDLEWARE,
  POST_RENDER_MIDDLEWARE,
  usePreRenderMiddleware,
  usePostRenderMiddleware
} from '../lib/component-renderer';
import { Route } from '../lib/route';
import { createMiddleware } from '../lib/middleware';

class MockDCL {
  loadNextToLocation: Function = jasmine.createSpy('loadNextToLocation').and.returnValue(Observable.of(true).toPromise())
}

class TestComponent{}

describe('Component Renderer', function() {
  let route: Route,
      renderer: ComponentRenderer,
      injector: Injector,
      loader: any;

  describe('Rendering', () => {
    let route;
    let elementRef = {};
    let providers = [];

    beforeEach(() => {
      injector = Injector.resolveAndCreate([
        ComponentRenderer,
        provide(PRE_RENDER_MIDDLEWARE, { useValue: [] }),
        provide(POST_RENDER_MIDDLEWARE, { useValue: [] }),
        provide(DynamicComponentLoader, {useClass: MockDCL}),
        RESOURCE_LOADER_PROVIDERS
      ]);

      renderer = injector.get(ComponentRenderer);
      loader = injector.get(DynamicComponentLoader);
    });

    it('should render a component', (done) => {
      route = { component: TestComponent };
      let render = renderer.render(route, injector, <ElementRef>elementRef, loader, providers);

      render.subscribe(() => {
        expect(loader.loadNextToLocation).toHaveBeenCalledWith(route.component, elementRef, providers);
        done();
      });
    });

    it('should render a loaded component', (done) => {
      route = {
        loadComponent: () => Promise.resolve(TestComponent)
      };

      let render = renderer.render(route, injector, <ElementRef>elementRef, loader, providers);

      render.subscribe(() => {
        expect(loader.loadNextToLocation).toHaveBeenCalledWith(TestComponent, elementRef, providers);
        done();
      });
    });
  });

  describe('Pre Middleware', () => {
    let route: Route = { component: TestComponent };
    let providers = [];
    let elementRef = {};
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

      injector = Injector.resolveAndCreate([
        ComponentRenderer,
        usePreRenderMiddleware(renderMiddleware),
        provide(POST_RENDER_MIDDLEWARE, {useValue: []}),
        provide(DynamicComponentLoader, {useClass: MockDCL}),
        RESOURCE_LOADER_PROVIDERS
      ]);

      renderer = injector.get(ComponentRenderer);
      loader = injector.get(DynamicComponentLoader);
    });

    beforeEach(() => {
      render = renderer.render(route, injector, <ElementRef>elementRef, loader, providers);
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
    let elementRef = {};
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

      injector = Injector.resolveAndCreate([
        ComponentRenderer,
        usePostRenderMiddleware(renderMiddleware),
        provide(PRE_RENDER_MIDDLEWARE, {useValue: []}),
        provide(DynamicComponentLoader, {useClass: MockDCL}),
        RESOURCE_LOADER_PROVIDERS
      ]);

      renderer = injector.get(ComponentRenderer);
      loader = injector.get(DynamicComponentLoader);
    });

    beforeEach(() => {
      render = renderer.render(route, injector, <ElementRef>elementRef, loader, providers);
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
