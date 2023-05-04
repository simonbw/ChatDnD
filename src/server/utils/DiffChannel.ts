import jsonpatch from "fast-json-patch";
import { DiffStream } from "../../common/models/diffStreamSchema";
import { Channel } from "./Channel";

export class DiffChannel<T extends object> extends Channel<DiffStream<T>> {
  private lastState: T | undefined = undefined;

  public stateChanged(state: T) {
    if (this.lastState) {
      const diff = jsonpatch.compare(this.lastState, state);
      if (diff.length > 0) {
        this.publish({ type: "diff", diff });
      }
    } else {
      this.publish({ type: "replace", state });
    }
    this.lastState = state;
  }
}
