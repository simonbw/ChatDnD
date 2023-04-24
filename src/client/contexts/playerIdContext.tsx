import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useState,
} from "react";
import { useRoom } from "../hooks/useRoomState";

type PlayerId = string;

const PlayerIdContext = createContext<PlayerId>("");

export function PlayerContextProvider({ children }: PropsWithChildren) {
  const [playerId] = useState<PlayerId>(() => getPlayerId());

  return (
    <PlayerIdContext.Provider value={playerId}>
      {children}
    </PlayerIdContext.Provider>
  );
}

export function usePlayerId() {
  return useContext(PlayerIdContext);
}

export function usePlayer() {
  const { room } = useRoom();
  const playerId = usePlayerId();
  return room?.players.find((p) => p.id === playerId);
}

function getPlayerId(): PlayerId {
  const maybeId = localStorage.getItem("playerId");
  if (isValidId(maybeId)) {
    console.log("Loaded playerId:", maybeId);
    return maybeId;
  } else {
    const playerId = makePlayerId();
    localStorage.setItem("playerId", playerId);
    if (maybeId) {
      console.warn("Invalid playerId found:", maybeId);
    }
    console.log("Created new playerId:", playerId);
    return playerId;
  }
}

const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_";
function makePlayerId(): PlayerId {
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

const validIdRegex = /^[a-zA-Z0-9_]+$/;
function isValidId(maybeId: string | null): maybeId is string {
  return maybeId != null && maybeId != "" && validIdRegex.test(maybeId);
}
