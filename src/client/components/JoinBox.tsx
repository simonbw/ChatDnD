import React, { useState } from "react";
import { z } from "zod";
import { usePlayerContext } from "../contexts/playerContext";
import { relativeUrl } from "../utils/relativeUrl";
import { Button } from "./Button";
import { classNames } from "./classNames";
import { NameTag } from "./NameTag";

export function JoinBox() {
  const { player, setPlayer } = usePlayerContext();
  const [name, setName] = useState(player?.name ?? "");

  const submit = async () => {
    try {
      const player = { name, id: name };
      const response = await fetch(relativeUrl("join"), {
        method: "post",
        body: JSON.stringify(player),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((response) => z.record(z.any()).parse(response));
      if (response.success) {
        console.log("setting player", player);
        setPlayer(player);
      }
    } catch (error) {
      console.warn("Failed to join room");
    }
  };

  return (
    <div className="flex flex-col justify-center gap-2 p-4 font-serif border-t-4 border-sepia-300 border-double items-center rounded-sm text-sepia-500">
      <p className="text-sm">Enter your name to join the game</p>
      <label>
        <input
          type="text"
          className={classNames(
            "block",
            "px-2 py-1 bg-transparent rounded text-center",
            "transition-colors duration-150",
            "underline underline-offset-1",
            "text-sepia-500 text-xl font-nametag",
            "focus:outline-none focus:border-none focus:bg-sepia-500/[15%] hover:bg-sepia-500/20 focus:hover:bg-sepia-500/20"
          )}
          onChange={(e) => setName(e.target.value)}
          value={name}
          id="player-name"
        />
      </label>
      <Button
        kind="flat"
        color="primary"
        onClick={submit}
        className="uppercase"
      >
        Join
      </Button>
    </div>
  );
}
