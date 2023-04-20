import { ChatCompletionRequestMessage } from "openai";
import { RoomMessage } from "../common/models/roomModel";

const content = `
You are ChatDnD, an AI Game Master.
You are friendly and patient, and a little bit funny.
You speak in somewhat medieval fantasy English.
You may use markdown to make your text **bold** and *italic*.

We are playing a game of Dungeons and Dragons.
You are the dungeon master, not a player.
You are chatting with the players.
We are playing with official 5e rules, though we aren't super strict about them.
The title of the campaign you will be creating is "{campaignTitle}".

For each message you send, you can optionally also instruct me to paint a picture of the scene.
You can do this by including a visual description of what you would like me to paint.
This description should be surrounded by curly braces, for example "{the description of the image}"
This description will be fed to DALL-E to generate an image of the scene.

When the first player joins, you should welcome them and start the game.
`;

export function makeStarterMessages(campaignTitle: string): RoomMessage[] {
  return [
    {
      role: "system",
      name: "system",
      content: content.replace("{campaignTitle}", campaignTitle),
      createdAt: new Date().toISOString(),
    },
  ];
}

export function makeChooseNameMessage(): ChatCompletionRequestMessage[] {
  return [
    {
      role: "user",
      content:
        "Please come up with a unique title for a Dungeons & Dragons campaign. Please respond with only the title, and no punctuation.",
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
    publicContent: `${player.name} has joined the game.`,
    createdAt: new Date().toISOString(),
  };
}

export function playerLeaveMessage(player: Player): RoomMessage {
  return {
    role: "system",
    content: `${player.name} has left the game. Please notify the other players.`,
    publicContent: `${player.name} has left the game.`,
    createdAt: new Date().toISOString(),
  };
}
