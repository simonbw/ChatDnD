import { ChatCompletionRequestMessage } from "openai";
import { Character } from "../../common/models/characterModel";
import { omit } from "../../common/utils/arrayUtils";

function baseInfo(character: Partial<Character>): string {
  let result = `We are generating a fantasy RPG player character. `;

  if (character.name) {
    result += `The character's name is ${character.name}. `;
  }
  if (character.pronouns) {
    result += `The character's pronouns are ${character.pronouns}. `;
  }
  if (character.characterClass) {
    result += `The character's class is ${character.characterClass}. `;
  }
  if (character.race) {
    result += `The character's race is ${character.race}. `;
  }
  if (character.background) {
    result += `The character's background is ${character.background}. `;
  }

  return result;
}

export function generateBackgroundMessage(
  character: Partial<Character>
): ChatCompletionRequestMessage[] {
  const base = baseInfo({ ...character, background: "" });
  return [
    {
      role: "user",
      content: `${base}. Write me a short background (approximately 100 words) for our character.`,
    },
  ];
}

export function generateDescriptionMessage(
  character: Partial<Character>
): ChatCompletionRequestMessage[] {
  const base = baseInfo({ ...character, description: "" });
  return [
    {
      role: "user",
      content: `${base}. Write me a short description, (approximately 50 words) of our character's physical attributes and personality.`,
    },
  ];
}

export function generateNameMessage(
  character: Partial<Character>
): ChatCompletionRequestMessage[] {
  const base = baseInfo({ ...character, name: "" });
  return [
    {
      role: "user",
      content: `${base}. Please suggest a name for this character. Response with only the name.`,
    },
  ];
}

export function generatePortraitMessage(
  character: Partial<Character>
): ChatCompletionRequestMessage[] {
  const base = baseInfo({ ...character, name: "" });
  return [
    {
      role: "user",
      content: `${base}. Write a one sentence visual description of this character that you might give to a sketch artist.`,
    },
  ];
}
