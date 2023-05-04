import { idMaker } from "../../common/utils/idMaker";

const makeId = idMaker();

type ListenerId = string;

/**
 * A very simple pub-sub channel.
 */
export class Channel<T> {
  private listeners = new Map();

  get numberOfListeners(): number {
    return this.listeners.size;
  }

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
