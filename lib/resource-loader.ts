import { Injectable, Provider } from 'angular2/core';

export type Async<T> = () => Promise<T>;

@Injectable()
export class ResourceLoader {
  load<T>(sync: T, async: Async<T>, defaultValue?: any): Promise<T> {
    if (!!sync) {
      return Promise.resolve(sync);
    }

    else if (!!async) {
      return Promise.resolve(async());
    }

    return Promise.resolve(defaultValue);
  }
}


export const RESOURCE_LOADER_PROVIDERS = [
  new Provider(ResourceLoader, { useClass: ResourceLoader })
];
