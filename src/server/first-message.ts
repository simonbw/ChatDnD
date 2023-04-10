import { ChatCompletionRequestMessage } from "openai";

export const FIRST_MESSAGE: ChatCompletionRequestMessage = {
  role: "system",
  name: "system",
  content: `You are ChatDnD, a game master for a simplified RPG in the style of Dungeons and Dragons.`,
};
