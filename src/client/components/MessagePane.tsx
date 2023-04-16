import React from "react";
import { usePlayerContext } from "../contexts/playerContext";
import { useRoom } from "../hooks/useRoomState";
import { JoinBox } from "./JoinBox";
import { Message } from "./Message";
import { SendBox } from "./SendBox";

export function MessagePane() {
  const { state } = useRoom();
  const { player } = usePlayerContext();

  const isInGame = Boolean(
    player?.name && state?.players.includes(player?.name)
  );

  return (
    <div className="flex flex-col font-serif gap-8">
      <h1 className="text-center text-6xl text-sepia-600 font-heading-1">
        Chat DnD
      </h1>
      <div className="flex-grow flex flex-col gap-0">
        {state?.messages.length == 0 && (
          <div className="italic p-2 text-sepia-500 text-center">
            No messages yet
          </div>
        )}
        {state?.messages.map((message, i) => (
          <Message message={message} key={i} />
        ))}
      </div>

      {isInGame ? <SendBox /> : <JoinBox />}
    </div>
  );
}
