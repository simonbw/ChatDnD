import { Player } from "../../common/models/playerModel";
import {
  objectivePronoun,
  possessivePronoun,
} from "../../common/models/pronouns";
import { RoomMessage } from "../../common/models/roomModel";
import { actionNameEnum } from "./abilitiesPromptContent";

export function playerJoinMessage(
  player: Player,
  otherPlayers: Player[]
): RoomMessage {
  const character = player.character;

  const lines = [
    `The player ${player.name}, whose pronouns are ${player.pronouns}, has just joined the game.`,
    `${player.name} is playing the character ${character.name}, whose pronouns are ${character.pronouns}.`,
    `${character.name} is a level 1 ${character.race} ${character.characterClass}.`,
    `Here is the background of ${character.name}: "${character.background}"`,
    `Here is a description of ${character.name}:\n"${character.description}"\n`,
    `Please give ${character.name} ${possessivePronoun(
      character.pronouns
    )} starting items using the {${actionNameEnum.Enum.GiveItem}} action.`,
  ];

  if (otherPlayers.length == 0) {
    lines.push(
      `\nPlease welcome ${player.name} to the game and begin the campaign.`
    );
  } else {
    lines.push(
      `\nPlease describe how ${
        character.name
      } arrives in the game, and describe ${objectivePronoun(
        character.pronouns
      )} to the rest of the group.`
    );
  }

  const content = lines.join(" ");

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
    content: `${player.name} has left the game.`,
    publicContent: `${player.character.name} has left the game.`,
    images,
    createdAt: new Date().toISOString(),
  };
}
