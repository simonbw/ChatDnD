import axios from "axios";
import { useEffect, useState } from "react";
import { RoomState, roomStateSchema } from "../../common/roomModel";
import { relativeUrl } from "../utils/relativeUrl";

export function useRoomState() {
  const [state, setState] = useState<RoomState | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const response = await axios.get(relativeUrl("state"));

      const maybeResponseState = roomStateSchema.safeParse(response.data);

      if (!maybeResponseState.success) {
        console.error(maybeResponseState.error);
        console.error(response.data);
        return;
      }

      if (maybeResponseState) {
        setState(maybeResponseState.data);
      }

      const eventSource = new EventSource(relativeUrl("state-stream"));

      eventSource.onmessage = (event) => {
        console.log(event);
        setState(JSON.parse(event.data));
      };
    })();
  }, []);

  return state;
}
