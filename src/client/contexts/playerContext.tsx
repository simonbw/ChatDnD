import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useState,
} from "react";
import { z } from "zod";

interface Player {
  name: string;
  id: string;
}

interface PlayerContextValue {
  player: Player | undefined;
  setPlayer: (player: Player) => Promise<void>;
}

const PlayerContext = createContext<PlayerContextValue>({
  player: undefined,
  setPlayer: () => Promise.resolve(),
});

export function PlayerContextProvider({ children }: PropsWithChildren) {
  const [player, setPlayer] = useState<Player | undefined>(loadPlayer);

  async function joinGame(player: Player) {
    setPlayer(player);
    localStorage.setItem("player", JSON.stringify(player));
  }

  return (
    <PlayerContext.Provider value={{ player, setPlayer: joinGame }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayerContext() {
  return useContext(PlayerContext);
}

function loadPlayer(): Player | undefined {
  const playerString = localStorage.getItem("player");
  if (!playerString) {
    return undefined;
  }
  try {
    const maybePlayer = JSON.parse(playerString);
    return z.object({ name: z.string(), id: z.string() }).parse(maybePlayer);
  } catch (error) {
    return undefined;
  }
}
