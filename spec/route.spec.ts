import { IndexRoute, getNamedComponents } from '../lib/route';

describe('Route', function() {
  describe('getNamedComponents', function() {
    class FixtureA { }
    class FixtureB { }
    const FixctureC = () => Promise.resolve(FixtureA);
    const FixctureD = () => Promise.resolve(FixtureB);

    it('should return the unnamed component when no name is provided', function() {
      const resolved = getNamedComponents({
        component: FixtureA,
        loadComponent: FixctureC
      });

      expect(resolved.component).toBe(FixtureA);
      expect(resolved.loadComponent).toBe(FixctureC);
    });

    it('should return the named component when a name is provided', function() {
      const route: IndexRoute = {
        components: {
          main: FixtureB
        },
        loadComponents: {
          main: FixctureD
        }
      };

      const resolved = getNamedComponents(route, 'main');

      expect(resolved.component).toBe(FixtureB);
      expect(resolved.loadComponent).toBe(FixctureD);
    });

    it('should return null for undefined routes', function() {
      const resolved = getNamedComponents(undefined, 'main');

      expect(resolved.component).toBe(null);
      expect(resolved.loadComponent).toBe(null);
    });
  });
});
