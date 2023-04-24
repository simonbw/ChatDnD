import { Player } from "../../common/models/playerModel";
import {
  objectivePronoun,
  possessivePronoun,
  subjectivePronoun,
  toBe,
} from "../../common/models/pronouns";
import { RoomMessage } from "../../common/models/roomModel";

export function playerJoinMessage(player: Player): RoomMessage {
  const character = player.character;

  const content = [
    `The player ${player.name}, whose pronouns are ${player.pronouns}, has just joined the game.`,
    `${player.name} is playing the character ${character.name}, whose pronouns are ${character.pronouns}.`,
    `${character.name} is a level 1 ${character.race} ${character.characterClass}.`,
    `Here is the background of ${character.name}: "${character.background}"`,
    `Here is a description of ${character.name}:\n"${character.description}"\n`,
    `\nPlease welcome ${player.name} to the game.`,
  ].join(" ");

  return {
    role: "system",
    content,
    publicContent: `${player.character.name} has joined the game.`,
    createdAt: new Date().toISOString(),
  };
}

export function playerLeaveMessage(player: Player): RoomMessage {
  const images: RoomMessage["images"] = [];
  const portrait = player.character.portrait;
  if (portrait) {
    images.push({ description: portrait.caption, url: portrait.url });
  }
  return {
    role: "system",
    content: `${player.name} has left the game. Please notify the other players.`,
    publicContent: `${player.character.name} has left the game.`,
    images,
    createdAt: new Date().toISOString(),
  };
}
