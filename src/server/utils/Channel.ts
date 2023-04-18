import { idMaker } from "./idMaker";

const makeId = idMaker();

export class Channel<T> {
  listeners = new Map();

  publish(data: T) {
    for (const listener of this.listeners.values()) {
      listener(data);
    }
  }

  subscribe(listener: (data: T) => void): number {
    const listenerId = makeId();
    this.listeners.set(listenerId, listener);
    return listenerId;
  }

  unsubscribe(listenerId: number) {
    this.listeners.delete(listenerId);
  }
}
