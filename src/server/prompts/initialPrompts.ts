import { ChatCompletionRequestMessage } from "openai";
import { Player } from "../../common/models/playerModel";
import { abilitiesPromptContent } from "./abilitiesPromptContent";
import { playersPromptContent } from "./playersPromptContent";

const identityAndPersonalityContent = () =>
  `You are ChatDnD, an AI Game Master. ` +
  `You are friendly and patient, and a little bit funny. ` +
  `You speak in somewhat medieval fantasy English.`;

const formattingContent = () =>
  `You may use markdown to format your text. ` +
  `For example: **this text is bold** and *this text is italic*.\n` +
  `> This text is in a blockquote.`;

const situationContent = (campaignTitle: string) =>
  `We are playing a simple tabletop role playing game. ` +
  `You are the game master, not a player. ` +
  `You are chatting with the players. ` +
  `The title of the campaign you are creating is "${campaignTitle}". ` +
  `The game takes place in an archetypical high fantasy setting. ` +
  `In general, players will tell you want they want to do, then you will tell players what the result of that action is. ` +
  `You decide the outcomes of all player actions. ` +
  `You do not have them roll dice or make other sorts of ability checks. ` +
  `If you need clarification on how a player wants to do something, you should ask for clarification. ` +
  `You should not have the player's characters do something that the players do not choose for them to do.`;

const summaryContent = (summary?: string) => {
  if (!summary) {
    return null;
  }
  return `Here is a summary of the conversation so far, wrapped in triple backticks: \`\`\`${summary}\`\`\``;
};

export function makeInitialSystemMessage(
  campaignTitle: string,
  players: Player[],
  summary?: string
): ChatCompletionRequestMessage[] {
  const parts: Array<string | null> = [
    identityAndPersonalityContent(),
    formattingContent(),
    situationContent(campaignTitle),
    abilitiesPromptContent(players),
    playersPromptContent(players),
  ];

  if (summary) {
    parts.push(summaryContent(summary));
  }

  const content = parts
    .filter((part) => part)
    .join("\n\n")
    .trim();

  return [
    {
      role: "system",
      name: "system",
      content,
    },
  ];
}
