import { NgZone } from 'angular2/core';
import { Operator } from 'rxjs/Operator';
import { Subscriber } from 'rxjs/Subscriber';


export class ZoneOperator<T> implements Operator<T, T> {
  constructor(private _zone: NgZone) { }

  call(subscriber: Subscriber<T>, source: any): any {
    return source._subscribe(new ZoneSubscriber(subscriber, this._zone));
  }
}

class ZoneSubscriber<T> extends Subscriber<T> {
  constructor(destination: Subscriber<T>, private _zone: NgZone) {
    super(destination);
  }

  protected _next(value: T) {
    this._zone.run(() => this.destination.next(value));
  }
}
