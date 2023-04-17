import axios from "axios";
import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { RoomState, roomStateSchema } from "../../common/models/roomModel";
import { relativeUrl } from "../utils/relativeUrl";

export function useRoom() {
  return useContext(RoomContext);
}

const RoomContext = createContext<{ state: RoomState | undefined }>({
  state: undefined,
});

export function RoomProvider({ children }: PropsWithChildren) {
  const [state, setRoomState] = useState<RoomState | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const response = await axios.get(relativeUrl("state"));

      await wait(5000);

      const maybeResponseState = roomStateSchema.safeParse(response.data);

      if (!maybeResponseState.success) {
        console.error(maybeResponseState.error);
        console.error(response.data);
        return;
      }

      if (maybeResponseState) {
        setRoomState(maybeResponseState.data);
      }

      const eventSource = new EventSource(relativeUrl("state-stream"));

      eventSource.onmessage = (event) => {
        setRoomState(roomStateSchema.parse(JSON.parse(event.data)));
      };
    })();
  }, []);

  return (
    <RoomContext.Provider value={{ state }}>{children}</RoomContext.Provider>
  );
}

async function wait(delay: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}
