import React, { PropsWithChildren } from "react";
import { Player } from "../../common/models/playerModel";
import { routes } from "../../common/routes";
import { last } from "../../common/utils/arrayUtils";
import { LoadingIndicator } from "./LoadingIndicator";
import { Message } from "./Message";
import { NameTag } from "./NameTag";
import { SendBox } from "./SendBox";
import { Separator } from "./Separator";
import { useRoom } from "../contexts/roomContext";
import { usePlayerId } from "../contexts/playerIdContext";

export function MessagesPane() {
  const { room } = useRoom();
  const playerId = usePlayerId();

  if (!room) {
    return (
      <Wrapper>
        <div className="p-4 flex justify-center">
          <LoadingIndicator />
        </div>
      </Wrapper>
    );
  }

  const isInGame = room.players.some((player) => player.id === playerId);

  return (
    <Wrapper>
      <header className="flex flex-col justify-center hyphens-auto w-full">
        <h1 className="page-title">{room.name}</h1>
        <PlayerList players={room.players} />
      </header>

      <div className="flex-grow flex flex-col gap-0">
        {room.messages.length == 0 && (
          <div className="italic p-2 text-sepia-500 text-center">
            No messages yet
          </div>
        )}
        {room.messages.map((message, i) => (
          <Message message={message} key={i} />
        ))}
      </div>

      <Separator />

      <div className="animate-fade-in">
        {isInGame && <SendBox roomId={room.id} />}
      </div>
    </Wrapper>
  );
}

function PlayerList({ players }: { players: Player[] }) {
  if (players.length == 0) {
    return null;
  }

  const finalPlayer = last(players);
  const secondToLast = players[players.length - 2];
  const start = players.slice(0, Math.max(players.length - 3, 0));

  return (
    <h2 className="page-subtitle">
      <span className="text-md italic">An adventure featuring</span>
      {secondToLast && <br />}
      {start.map((player) => (
        <span className="mx-1" key={player.id}>
          <NameTag size="md">{player.character.name}</NameTag>,
        </span>
      ))}
      {secondToLast && (
        <span className="mx-1">
          <NameTag size="md">{secondToLast.character.name}</NameTag>{" "}
          <span className="italic">and</span>{" "}
        </span>
      )}
      <span className="mx-1">
        <NameTag size="md">{finalPlayer.character.name}</NameTag>,
      </span>
    </h2>
  );
}

function Wrapper({ children }: PropsWithChildren) {
  return (
    <>
      <div className="mb-2">
        <a className="link" href={routes.home()}>
          ◄ Home
        </a>
      </div>
      <div className="flex flex-col font-serif gap-8">{children}</div>
    </>
  );
}
