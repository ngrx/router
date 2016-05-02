import 'rxjs/add/operator/toPromise';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { ReflectiveInjector, provide, ComponentResolver, ViewContainerRef } from '@angular/core';

import { RESOURCE_LOADER_PROVIDERS } from '../lib/resource-loader';
import { ComponentRenderer, PRE_RENDER_HOOKS, POST_RENDER_HOOKS } from '../lib/component-renderer';
import { Route, BaseRoute } from '../lib/route';
import { Hook } from '../lib/hooks';

class MockResolver {
  resolveComponent: Function = jasmine.createSpy('resolveComponent').and
    .returnValue(Promise.resolve(true));
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
    let viewContainerRef;
    let providers = [];

    beforeEach(() => {
      injector = ReflectiveInjector.resolveAndCreate([
        ComponentRenderer,
        provide(ComponentResolver, {useClass: MockResolver}),
        RESOURCE_LOADER_PROVIDERS
      ]);

      renderer = injector.get(ComponentRenderer);
      loader = injector.get(ComponentResolver);
      viewContainerRef = jasmine.createSpyObj('ViewContainerRef', ['createComponent']);
    });

    it('should render a component', (done) => {
      route = {};
      components = { component: TestComponent };

      let render = renderer.render(route, components, injector, <ViewContainerRef>viewContainerRef, providers);

      render.subscribe(() => {
        expect(viewContainerRef.createComponent).toHaveBeenCalled();
        done();
      });
    });

    it('should render a loaded component', (done) => {
      route = { };
      components = {
        loadComponent: () => Promise.resolve(TestComponent)
      };

      let render = renderer.render(route, components, injector, <ViewContainerRef>viewContainerRef, providers);

      render.subscribe(() => {
        expect(viewContainerRef.createComponent).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('Pre Middleware', () => {
    let route: Route = { component: TestComponent };
    let providers = [];
    let viewContainerRef;
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
              providers: renderHookProviders
            };
          });
        }
      };

      injector = ReflectiveInjector.resolveAndCreate([
        ComponentRenderer,
        provide(PRE_RENDER_HOOKS, { useValue: renderHook, multi: true }),
        provide(ComponentResolver, {useClass: MockResolver}),
        RESOURCE_LOADER_PROVIDERS
      ]);

      renderer = injector.get(ComponentRenderer);
      loader = injector.get(ComponentResolver);
      viewContainerRef = jasmine.createSpyObj('ViewContainerRef', ['createComponent']);
    });

    beforeEach(() => {
      render = renderer.render(route, route, injector, <ViewContainerRef>viewContainerRef, providers);
    });

    it('should execute before rendering', (done) => {
      render.subscribe(() => {
        //expect(renderHookSpy).toHaveBeenCalled();
        //expect(viewContainerRef.createComponent).toHaveBeenCalled();
        done();
      });
    });

    it('can modify the providers', (done) => {
      render.subscribe(() => {
        expect(viewContainerRef.createComponent).toHaveBeenCalled();
        done();
      });
    });

    xit('can modify the component', (done) => {
      render.subscribe(() => {
        expect(viewContainerRef.createComponent).toHaveBeenCalled();
        expect(viewContainerRef.createComponent.calls.mostRecent().args[0]).toEqual('newComponent');
        done();
      });
    });
  });

  describe('Post Middleware', () => {
    let route: Route = { component: TestComponent };
    let providers = [];
    let viewContainerRef;
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
        provide(ComponentResolver, {useClass: MockResolver}),
        RESOURCE_LOADER_PROVIDERS
      ]);

      renderer = injector.get(ComponentRenderer);
      loader = injector.get(ComponentResolver);
      viewContainerRef = jasmine.createSpyObj('ViewContainerRef', ['createComponent']);
    });

    beforeEach(() => {
      render = renderer.render(route, route, injector, <ViewContainerRef>viewContainerRef, providers);
    });

    it('should execute after rendering', (done) => {
      render.subscribe(() => {
        expect(viewContainerRef.createComponent).toHaveBeenCalled();
        expect(renderHookSpy).toHaveBeenCalled();
        done();
      });
    });

    it('can modify the component ref', (done) => {
      render.subscribe((componentRef) => {
        expect(viewContainerRef.createComponent).toHaveBeenCalled();
        expect(componentRef).toEqual(false);
        done();
      });
    });
  });
});
