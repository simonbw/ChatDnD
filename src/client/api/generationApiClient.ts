import {
  generateCharacterRequestBody,
  getCharacterBackgroundResponse,
  getCharacterDescriptionResponse,
  getCharacterNameResponse,
  getCharacterPortraitResponse,
} from "../../common/api-schemas/generationApiSchemas";
import { routes } from "../../common/routes";
import { makeJsonEndpoint } from "./apiUtil";

export const generateCharacterBackground = makeJsonEndpoint(
  "post",
  routes.generate.character.background(),
  generateCharacterRequestBody,
  getCharacterBackgroundResponse
);

export const generateCharacterDescription = makeJsonEndpoint(
  "post",
  routes.generate.character.description(),
  generateCharacterRequestBody,
  getCharacterDescriptionResponse
);

export const generateCharacterName = makeJsonEndpoint(
  "post",
  routes.generate.character.name(),
  generateCharacterRequestBody,
  getCharacterNameResponse
);

export const generateCharacterPortrait = makeJsonEndpoint(
  "post",
  routes.generate.character.portrait(),
  generateCharacterRequestBody,
  getCharacterPortraitResponse
);
