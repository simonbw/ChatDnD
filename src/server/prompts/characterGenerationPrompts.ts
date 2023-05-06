import { ChatCompletionRequestMessage } from "openai";
import { Character } from "../../common/models/characterModel";

function baseInfo(character: Partial<Character>): string {
  let lines = [`We are generating a fantasy RPG player character.`];

  if (character.name) {
    lines.push(`The character's name is "${character.name}".`);
  }
  if (character.pronouns) {
    lines.push(`The character's pronouns are "${character.pronouns}".`);
  }
  if (character.characterClass) {
    lines.push(`The character's class is "${character.characterClass}".`);
  }
  if (character.race) {
    lines.push(`The character's race is "${character.race}".`);
  }
  if (character.background) {
    lines.push(`The character's background is "${character.background}".`);
  }
  if (character.description) {
    lines.push(`The character's description is "${character.background}".`);
  }

  return lines.join(" ") + "\n";
}

export function generateBackgroundMessage(
  character: Partial<Character>
): ChatCompletionRequestMessage[] {
  const base = baseInfo({ ...character });
  return [
    {
      role: "user",
      content: `${base}. Write me a short background (less than 50 words) for our character.`,
    },
  ];
}

export function generateDescriptionMessage(
  character: Partial<Character>
): ChatCompletionRequestMessage[] {
  const base = baseInfo({ ...character });
  return [
    {
      role: "user",
      content: `${base}. Write me a short (less than 40 words) description of our character's physical attributes and personality.`,
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
      content: `${base}. Please suggest a full name for this character. Response with only the name, no extra punctuation.`,
    },
  ];
}

export function generatePortraitMessage(
  character: Partial<Character>
): ChatCompletionRequestMessage[] {
  const base = baseInfo({ ...character });
  return [
    {
      role: "user",
      content:
        `${base}\n` +
        `Write 10 descriptors (one or two words each), separated by commas, that describe what this character looks like. ` +
        `Make sure to include hair color, eye color, skin tone, and facial expression.` +
        `Do not number your list.`,
    },
  ];
}
