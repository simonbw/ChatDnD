import { Character } from "../../../src/common/models/characterModel";
import { Pronouns } from "../../../src/common/models/pronouns";
import { cleanupChatResponse, textResponse } from "../llm";
import { generatePortraitMessage } from "./characterGenerationPrompts";

export async function makeCharacterPortraitCaption(character: Character) {
  console.log("Getting portrait prompt...");
  const adjectives = cleanupChatResponse(
    await textResponse(generatePortraitMessage(character), {
      temperature: 0.5,
    }),
    { singlePhrase: true, stripQuotes: true }
  );

  const adjectiveList = adjectives
    .split(",")
    .map((s) => s.trim())
    .join(", ");
  return (
    `A ${getGenderAdjectives(character.pronouns)} ` +
    `${character.race} ${character.characterClass} ` +
    `with ${adjectiveList}.`
  );
}

function getGenderAdjectives(pronouns: Pronouns): string {
  switch (pronouns) {
    case "He/Him":
      return "male";
    case "She/Her":
      return "female";
    case "They/Them":
    case "It/Its":
      return "androgenous";
  }
}
