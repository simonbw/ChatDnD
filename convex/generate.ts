import { action } from "./_generated/server";
import { drawPortrait } from "./lib/images";
import { cleanupChatResponse, textResponse } from "./lib/llm";
import {
  generateBackgroundMessage,
  generateDescriptionMessage,
  generateNameMessage,
} from "./lib/prompts/characterGenerationPrompts";
import { makeCharacterPortraitCaption } from "./lib/prompts/makeCharacterPortraitCaption";
import { characterValidator } from "./lib/validators";

/*
 * Character-creation helpers, called from the join form's 🎲 buttons.
 * Each takes the character as drawn up so far.
 */

export const characterName = action({
  args: { character: characterValidator },
  handler: async (_ctx, { character }) => {
    const name = cleanupChatResponse(
      await textResponse(generateNameMessage(character), {
        temperature: 1.2,
      }),
      { singlePhrase: true }
    );
    return { name };
  },
});

export const characterBackground = action({
  args: { character: characterValidator },
  handler: async (_ctx, { character }) => {
    const background = await textResponse(
      generateBackgroundMessage(character),
      { temperature: 1 }
    );
    return { background };
  },
});

export const characterDescription = action({
  args: { character: characterValidator },
  handler: async (_ctx, { character }) => {
    const description = await textResponse(
      generateDescriptionMessage(character),
      { temperature: 1 }
    );
    return { description };
  },
});

/** Draws a portrait, reusing the character's existing caption if it has one. */
export const characterPortrait = action({
  args: { character: characterValidator },
  handler: async (ctx, { character }) => {
    const caption =
      character.portrait?.caption ||
      (await makeCharacterPortraitCaption(character));
    return {
      portrait: { caption, url: await drawPortrait(ctx, caption) },
    };
  },
});
