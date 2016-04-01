import { Injector, OpaqueToken, provide } from 'angular2/core';

import { compose } from '../lib/util';
import { Middleware, createMiddleware, provideMiddlewareForToken } from '../lib/middleware';

describe('Middleware', function() {
  it('should allow you to compose middleware using providers', function() {
    const testToken = new OpaqueToken('Test Token');
    const middlewareProvider = provideMiddlewareForToken(testToken);

    const first = { apply: t => t };
    const second = { apply: t => t };
    const third = { apply: t => t };

    spyOn(first, 'apply');
    spyOn(second, 'apply');
    spyOn(third, 'apply');

    const secondProvider = provide(new OpaqueToken('Second Midleware'), {
      useValue: second.apply
    });

    const thirdProvider = createMiddleware(() => third.apply);

    const injector = Injector.resolveAndCreate([
      middlewareProvider(first.apply, secondProvider, thirdProvider)
    ]);

    const middlewareArray = injector.get(testToken);
    compose(...middlewareArray)();

    expect(first.apply).toHaveBeenCalled();
    expect(second.apply).toHaveBeenCalled();
    expect(third.apply).toHaveBeenCalled();
  });
});
