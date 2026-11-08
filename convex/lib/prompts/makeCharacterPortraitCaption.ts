import { Character } from "../../../src/common/models/characterModel";
import { Pronouns } from "../../../src/common/models/pronouns";
import { getGenerationGPTModel } from "../env";
import { cleanupChatResponse, simpleTextResponse } from "../openAiUtils";
import { generatePortraitMessage } from "./characterGenerationPrompts";

export async function makeCharacterPortraitCaption(character: Character) {
  console.log("Getting portrait prompt...");
  const adjectives = cleanupChatResponse(
    await simpleTextResponse(generatePortraitMessage(character), {
      temperature: 0.5,
      model: getGenerationGPTModel(),
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
