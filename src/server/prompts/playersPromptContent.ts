import { Player } from "../../common/models/playerModel";
import { possessivePronoun } from "../../common/models/pronouns";

export function playersPromptContent(players: readonly Player[]) {
  if (players.length === 0) {
    return `No one has joined the game yet.`;
  } else if (players.length === 1) {
    const player = players[0];
    const character = player.character;
    return (
      `There is currently one player in the game. ` +
      `${possessivePronoun(player.pronouns, true)} name is ${player.name}. ` +
      `${player.name} is playing the character ${character.name} (${character.pronouns}), ` +
      `a level 1 ${character.race} ${character.characterClass}.`
    );
  } else {
    const lines = [`There are ${players.length} players in the game:`];
    for (const player of players) {
      const character = player.character;
      lines.push(
        ` - ${player.name} (${player.pronouns}) playing the character ` +
          `${character.name} (${character.pronouns}), ` +
          `a level 1 ${character.race} ${character.characterClass}`
      );
    }
    return lines.join("\n");
  }
}
