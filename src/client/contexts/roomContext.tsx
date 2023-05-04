import React, { PropsWithChildren, createContext, useContext } from "react";
import {
  RoomPublicState,
  roomPublicStateSchema,
} from "../../common/models/roomModel";
import { routes } from "../../common/routes";
import { RoomId } from "../../server/room/roomSerialization";
import { useJsonDiffStream } from "../hooks/useJsonDiffStream";

export function useRoom() {
  return useContext(RoomContext);
}

const RoomContext = createContext<{ room: RoomPublicState | undefined }>({
  room: undefined,
});

export function RoomProvider({ children }: PropsWithChildren) {
  const roomId = useRoomId();

  const state = useJsonDiffStream(
    roomId && routes.room.stateStream(roomId),
    roomPublicStateSchema.parse
  );

  return (
    <RoomContext.Provider value={{ room: state }}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoomId(): RoomId | undefined {
  const p = window.location.pathname;
  const parts = p.split("/");
  if (parts[1] != "room") {
    return undefined;
  }
  return parts[2];
}
