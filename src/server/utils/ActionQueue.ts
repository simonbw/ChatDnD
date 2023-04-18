export class ActionQueue {
  private lastPromise: Promise<void> = Promise.resolve();

  addToQueue(action: () => Promise<void>) {
    return (this.lastPromise = this.lastPromise.then(() => action()));
  }
}
