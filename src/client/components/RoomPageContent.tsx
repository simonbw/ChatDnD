import React, { PropsWithChildren } from "react";
import { usePlayerContext } from "../contexts/playerContext";
import { useRoom } from "../hooks/useRoomState";
import { JoinBox } from "./JoinBox";
import { LoadingIndicator } from "./LoadingIndicator";
import { Message } from "./Message";
import { SendBox } from "./SendBox";
import { NameTag } from "./NameTag";
import { last } from "../../common/utils/arrayUtils";
import { HR } from "../pages/horizontalRule";

export function RoomPageContent() {
  const { room: state } = useRoom();
  const { player } = usePlayerContext();

  if (!state) {
    return (
      <Wrapper>
        <div className="p-4 flex justify-center">
          <LoadingIndicator />
        </div>
      </Wrapper>
    );
  }

  const isInGame = Boolean(player?.name && state.players.includes(player.name));

  return (
    <Wrapper>
      <header className="flex flex-col justify-center hyphens-auto w-full">
        <h1 className="text-center text-6xl text-sepia-700 font-heading-1">
          {state.name}
        </h1>
        <PlayerList players={state.players} />
      </header>

      {/* <HR /> */}

      <div className="flex-grow flex flex-col gap-0 animate-fade-in-slow">
        {state.messages.length == 0 && (
          <div className="italic p-2 text-sepia-500 text-center">
            No messages yet
          </div>
        )}
        {state.messages.map((message, i) => (
          <Message message={message} key={i} />
        ))}
      </div>

      <HR />

      <div className="animate-fade-in">
        {isInGame ? (
          <SendBox roomId={state.id} />
        ) : (
          <JoinBox roomId={state.id} />
        )}
      </div>
    </Wrapper>
  );
}

function PlayerList({ players }: { players: string[] }) {
  if (players.length == 0) {
    return null;
  }

  const finalPlayer = last(players);
  const secondToLast = players[players.length - 2];
  const start = players.slice(0, Math.max(players.length - 3, 0));

  return (
    <h2 className="text-md font-heading-2 text-sepia-500 mx-auto px-8 block text-center">
      <span className="text-md italic">An adventure featuring</span>
      {secondToLast && <br />}
      {start.map((player, i) => (
        <span className="" key={i}>
          <NameTag size="md">{player}</NameTag>,
        </span>
      ))}
      {secondToLast && (
        <span className="">
          <NameTag size="md">{secondToLast}</NameTag>{" "}
          <span className="italic">and</span>{" "}
        </span>
      )}
      <span className="">
        <NameTag size="md">{finalPlayer}</NameTag>,
      </span>
    </h2>
  );
}

function Wrapper({ children }: PropsWithChildren) {
  return <div className="flex flex-col font-serif gap-8">{children}</div>;
}
