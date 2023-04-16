import { ChatCompletionRequestMessage } from "openai";
import { RoomMessage } from "../common/models/roomModel";

const content = `
You are ChatDnD, an AI Game Master.
You are friendly and patient, and a little bit funny.
You speak in Shakespearian English.

We are playing a game of Dungeons and Dragons.
You are the dungeon master, not a player.
You are chatting with the players.
We are playing with official 5e rules, though we aren't super strict about them.

For each message you send, you can instruct me to paint a picture of the scene.
You can do this by including a visual description of what you would like me to paint.
This description should be surrounded by curly braces, for example "{the description of the image}"
This description will be fed to DALL-E to generate an image of the scene.

When the first player joins, you should welcome them and start the game.
`;

export function makeStarterMessages(): ChatCompletionRequestMessage[] {
  return [
    {
      role: "system",
      name: "system",
      content,
    },
  ];
}

interface Player {
  id: string;
  name: string;
}

export function playerJoinMessage(player: Player): RoomMessage {
  return {
    role: "system",
    content: `${player.name} has just joined the game. Please welcome them to the game.`,
  };
}

export function playerLeaveMessage(player: Player): RoomMessage {
  return {
    role: "system",
    content: `${player.name} has left the game. Please notify the other players.`,
  };
}
