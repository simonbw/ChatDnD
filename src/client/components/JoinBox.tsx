import React, { useState } from "react";
import { z } from "zod";
import { routes } from "../../common/routes";
import { usePlayerId } from "../contexts/playerIdContext";
import { classNames } from "../utils/classNames";
import { Button } from "./Button";

export function JoinBox({ roomId }: { roomId: string }) {
  const playerId = usePlayerId();
  const [name, setName] = useState("");

  const submit = async () => {
    try {
      const player = { name, id: playerId };
      await fetch(routes.room.join(roomId), {
        method: "post",
        body: JSON.stringify(player),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((response) => z.record(z.any()).parse(response));
    } catch (error) {
      console.warn("Failed to join room");
    }
  };

  return (
    <div
      className={classNames(
        "flex flex-col items-stretch xs:items-center text-center gap-2 font-serif py-4",
        "border-t-4 border-sepia/50 border-double"
      )}
    >
      <p className="text-sm">Enter your name to join the game</p>
      <label>
        <input
          type="text"
          className={classNames(
            "block w-full",
            "px-2 py-1 bg-transparent rounded text-center",
            "transition-colors duration-150",
            "underline underline-offset-1",
            "text-sepia-500 text-2xl font-nametag",
            "focus:outline-none focus:border-none focus:bg-sepia-500/[15%] hover:bg-sepia-500/20 focus:hover:bg-sepia-500/20"
          )}
          onChange={(e) => setName(e.target.value)}
          value={name}
          id="player-name"
        />
      </label>
      <Button kind="flat" color="primary" onClick={submit}>
        Join
      </Button>
    </div>
  );
}
