import React, { PropsWithChildren } from "react";
import { routes } from "../../common/routes";
import { last } from "../../common/utils/arrayUtils";
import { JoinBox } from "../components/JoinBox";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { Message } from "../components/Message";
import { NameTag } from "../components/NameTag";
import { SendBox } from "../components/SendBox";
import { Separator } from "../components/Separator";
import { useRoom } from "../hooks/useRoomState";
import { usePlayerId } from "./playerIdContext";

interface Player {
  id: string;
  name: string;
}

export function RoomPageContent() {
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
        <h1 className="text-center text-6xl text-sepia-700 font-heading-1">
          {room.name}
        </h1>
        <PlayerList players={room.players} />
      </header>

      {/* <HR /> */}

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
        {isInGame ? <SendBox roomId={room.id} /> : <JoinBox roomId={room.id} />}
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
    <h2 className="text-md font-heading-2 text-sepia-500 mx-auto px-8 block text-center">
      <span className="text-md italic">An adventure featuring</span>
      {secondToLast && <br />}
      {start.map((player) => (
        <span className="" key={player.id}>
          <NameTag size="md">{player.name}</NameTag>,
        </span>
      ))}
      {secondToLast && (
        <span className="">
          <NameTag size="md">{secondToLast.name}</NameTag>{" "}
          <span className="italic">and</span>{" "}
        </span>
      )}
      <span className="">
        <NameTag size="md">{finalPlayer.name}</NameTag>,
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
