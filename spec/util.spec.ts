import { Injector, Provider, OpaqueToken } from 'angular2/core';
import { createProviderFactory, compose } from '../lib/util';


describe('Router Utilities', function() {
  describe('createProviderFactory Helper', function() {
    it('should create a factory function for anonymous providers', function() {
      const factory = createProviderFactory('test');
      const provider = factory(() => ({}));

      expect(typeof factory).toBe('function');
      expect(provider instanceof Provider).toBe(true);
      expect((provider.token as OpaqueToken).toString()).toBe('Token test');
    });

    it('should use an existing token if provided', function() {
      const token = new OpaqueToken('existing');
      const factory = createProviderFactory('Test', token);
      const provider = factory(() => ({}));

      expect(provider.token).toBe(token);
    });

    it('should create multi-providers if specified', function() {
      const token = new OpaqueToken('existing');
      const factory = createProviderFactory('Test', token, true);
      const provider = factory(() => ({}));

      expect(provider.multi).toBe(true);
    });

    it('should create the provider as a factory', function() {
      const providerFactory = createProviderFactory('Test');
      const factory = () => ({});
      const provider = providerFactory(factory);

      expect(provider.useFactory).toBe(factory);
    });

    it('should pass dependencies to the provider', function() {
      const providerFactory = createProviderFactory('Test');
      const deps = [1, 2, 3];
      const provider = providerFactory(() => ({}), deps);

      expect(provider.dependencies).toBe(deps);
    });
  });

  describe('compose helper', function() {
    it('composes the functions from left to right', function() {
      const double = x => x * 2;
      const square = x => x * x;

      expect(compose(square)(5)).toBe(25);
      expect(compose(square, double)(5)).toBe(100);
      expect(compose(double, square)(5)).toBe(50);
    });
  });
});
