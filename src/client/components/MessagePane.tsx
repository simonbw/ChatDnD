import React, { PropsWithChildren } from "react";
import { usePlayerContext } from "../contexts/playerContext";
import { useRoom } from "../hooks/useRoomState";
import { JoinBox } from "./JoinBox";
import { Message } from "./Message";
import { SendBox } from "./SendBox";
import { LoadingDots } from "./LoadingDots";

export function MessagePane() {
  const { state } = useRoom();
  const { player } = usePlayerContext();

  if (!state) {
    return (
      <Wrapper>
        <div className="p-4 text-center">
          <LoadingDots size="xl" color="bg-sepia-500" />
        </div>
      </Wrapper>
    );
  }

  const isInGame = Boolean(player?.name && state.players.includes(player.name));

  return (
    <Wrapper>
      <div className="flex-grow flex flex-col gap-0">
        {state.messages.length == 0 && (
          <div className="italic p-2 text-sepia-500 text-center">
            No messages yet
          </div>
        )}
        {state.messages.map((message, i) => (
          <Message message={message} key={i} />
        ))}
      </div>

      {isInGame ? <SendBox /> : <JoinBox />}
    </Wrapper>
  );
}

function Wrapper({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col font-serif gap-8">
      <h1 className="text-center text-6xl text-sepia-700 font-heading-1">
        Chat DnD
      </h1>
      {children}
    </div>
  );
}
