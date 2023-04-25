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
  "get",
  routes.generate.character.background(),
  generateCharacterRequestBody,
  getCharacterBackgroundResponse
);

export const generateCharacterDescription = makeJsonEndpoint(
  "get",
  routes.generate.character.description(),
  generateCharacterRequestBody,
  getCharacterDescriptionResponse
);

export const generateCharacterName = makeJsonEndpoint(
  "get",
  routes.generate.character.name(),
  generateCharacterRequestBody,
  getCharacterNameResponse
);

export const generateCharacterPortrait = makeJsonEndpoint(
  "get",
  routes.generate.character.portrait(),
  generateCharacterRequestBody,
  getCharacterPortraitResponse
);
