import React from "react";
import { usePlayerId } from "../contexts/playerIdContext";
import { useRoom } from "../contexts/roomContext";
import { JoinBox } from "./JoinBox";
import { CharacterPortrait } from "./CharacterPortrait";
import { DissolveInImage } from "./DissolveInImage";
import { classNames } from "../utils/classNames";

export function CharacterPane() {
  const playerId = usePlayerId();
  const { room } = useRoom();

  if (!room) {
    return null;
  }

  const player = room.players.find((p) => p.id === playerId);

  if (!player) {
    return <JoinBox roomId={room.id} openToJoin={room.openToJoin} />;
  }

  const character = player.character;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="subpage-title">{player.character.name}</h1>
      <div className="">
        <div
          className={classNames(
            "sepia-[40%] float-left w-[50%] m-2 rounded border-4 border-sepia/50 border-double"
          )}
        >
          <DissolveInImage
            src={
              character.portrait?.url ?? "/static/images/missing-portrait.png"
            }
            width={512}
            height={512}
            className="w-full aspect-square"
            duration={1000}
          />
        </div>
        <section className="block leading-tight mb-2">
          <h3 className="font-nametag first-letter:text-lg first-letter:leading-none underline underline-offset-1">
            Race
          </h3>
          <div className="indent-4">{character.race}</div>
        </section>
        <section className="block leading-tight mb-2">
          <h3 className="font-nametag first-letter:text-lg first-letter:leading-none underline underline-offset-1">
            Class
          </h3>
          <div className="indent-4">{character.characterClass}</div>
        </section>
        <section className="block leading-tight mb-2">
          <h3 className="font-nametag first-letter:text-lg first-letter:leading-none underline underline-offset-1">
            Description
          </h3>
          <div className="indent-4">{character.description}</div>
        </section>
        <section className="block leading-tight mb-2">
          <h3 className="font-nametag first-letter:text-lg first-letter:leading-none underline underline-offset-1">
            Background
          </h3>
          <div className="indent-4">{character.background}</div>
        </section>
      </div>
    </div>
  );
}
