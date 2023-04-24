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

const RoomContext = createContext<{ room: RoomState | undefined }>({
  room: undefined,
});

export function RoomProvider({ children }: PropsWithChildren) {
  const [state, setRoomState] = useState<RoomState | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const eventSource = new EventSource(relativeUrl("state-stream"));

      eventSource.onmessage = (event) => {
        const rawData = JSON.parse(event.data);
        const maybeRoomState = roomStateSchema.safeParse(rawData);
        if (maybeRoomState.success) {
          setRoomState(maybeRoomState.data);
        } else {
          console.warn("invalid room recieved", maybeRoomState.error, rawData);
        }
      };
    })();
  }, []);

  return (
    <RoomContext.Provider value={{ room: state }}>
      {children}
    </RoomContext.Provider>
  );
}

async function wait(delay: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

export function useRoomId(): string | undefined {
  // TODO: Just get from url
  return useRoom().room?.id;
}
