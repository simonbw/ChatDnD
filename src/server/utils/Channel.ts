import { idMaker } from "./idMaker";

const makeId = idMaker();

type ListenerId = string;

export class Channel<T> {
  listeners = new Map();

  publish(data: T) {
    for (const listener of this.listeners.values()) {
      listener(data);
    }
  }

  subscribe(listener: (data: T) => void): ListenerId {
    const listenerId = makeId();
    this.listeners.set(listenerId, listener);
    return listenerId;
  }

  unsubscribe(listenerId: ListenerId) {
    this.listeners.delete(listenerId);
  }
}
