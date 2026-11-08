import { useQuery } from "convex/react";
import React, { PropsWithChildren, createContext, useContext } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { RoomPublicState } from "../../common/models/roomModel";

export type RoomId = string;

/** `undefined` while loading, `null` if the room doesn't exist. */
type RoomState = RoomPublicState | null | undefined;

export function useRoom() {
  return useContext(RoomContext);
}

const RoomContext = createContext<{ room: RoomState }>({
  room: undefined,
});

export function RoomProvider({ children }: PropsWithChildren) {
  const roomId = useRoomId();
  const room = useQuery(api.rooms.get, roomId ? { roomId } : "skip");

  // Only subscribe to messages once we know the id is a real room.
  const messageArgs = room ? { roomId: room.id as Id<"rooms"> } : "skip";
  const complete = useQuery(api.messages.listComplete, messageArgs);
  const inProgress = useQuery(api.messages.listInProgress, messageArgs);

  let state: RoomState;
  if (room === null || roomId === undefined) {
    state = null;
  } else if (room && complete) {
    const messages = [...complete, ...(inProgress ?? [])].sort(
      (a, b) => (a.id ?? 0) - (b.id ?? 0)
    );
    state = { ...room, messages };
  }

  return (
    <RoomContext.Provider value={{ room: state }}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoomId(): RoomId | undefined {
  const parts = window.location.pathname.split("/");
  if (parts[1] != "room" || !parts[2]) {
    return undefined;
  }
  return parts[2];
}
