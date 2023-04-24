import { characterSchema } from "../models/characterModel";

export const generateCharacterRequestBody = characterSchema;
export const generateCharacterResponse = characterSchema;

export const getCharacterBackgroundResponse = characterSchema.pick({
  background: true,
});

export const getCharacterDescriptionResponse = characterSchema.pick({
  description: true,
});

export const getCharacterNameResponse = characterSchema.pick({
  name: true,
});

export const getCharacterPortraitResponse = characterSchema
  .pick({ portrait: true })
  .required();
