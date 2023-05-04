import {
  generateCharacterRequestBody,
  getCharacterBackgroundResponse,
  getCharacterDescriptionResponse,
  getCharacterNameResponse,
  getCharacterPortraitResponse,
} from "../../common/api-schemas/generationApiSchemas";
import { routes } from "../../common/routes";
import { makeJsonEndpoint } from "./apiUtil";

export const generationApiClient = {
  characterBackground: makeJsonEndpoint(
    "post",
    routes.generate.character.background(),
    generateCharacterRequestBody,
    getCharacterBackgroundResponse
  ),

  characterDescription: makeJsonEndpoint(
    "post",
    routes.generate.character.description(),
    generateCharacterRequestBody,
    getCharacterDescriptionResponse
  ),

  characterName: makeJsonEndpoint(
    "post",
    routes.generate.character.name(),
    generateCharacterRequestBody,
    getCharacterNameResponse
  ),

  characterPortrait: makeJsonEndpoint(
    "post",
    routes.generate.character.portrait(),
    generateCharacterRequestBody,
    getCharacterPortraitResponse
  ),
};
