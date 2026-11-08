/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as generate from "../generate.js";
import type * as gm from "../gm.js";
import type * as lib_actionParser from "../lib/actionParser.js";
import type * as lib_env from "../lib/env.js";
import type * as lib_images from "../lib/images.js";
import type * as lib_inventory from "../lib/inventory.js";
import type * as lib_openAiUtils from "../lib/openAiUtils.js";
import type * as lib_prompts_abilitiesPromptContent from "../lib/prompts/abilitiesPromptContent.js";
import type * as lib_prompts_characterGenerationPrompts from "../lib/prompts/characterGenerationPrompts.js";
import type * as lib_prompts_initialPrompts from "../lib/prompts/initialPrompts.js";
import type * as lib_prompts_makeCharacterPortraitCaption from "../lib/prompts/makeCharacterPortraitCaption.js";
import type * as lib_prompts_playersPromptContent from "../lib/prompts/playersPromptContent.js";
import type * as lib_prompts_roomEventPrompts from "../lib/prompts/roomEventPrompts.js";
import type * as lib_roomHelpers from "../lib/roomHelpers.js";
import type * as lib_validators from "../lib/validators.js";
import type * as messages from "../messages.js";
import type * as players from "../players.js";
import type * as rooms from "../rooms.js";
import type * as summaries from "../summaries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  generate: typeof generate;
  gm: typeof gm;
  "lib/actionParser": typeof lib_actionParser;
  "lib/env": typeof lib_env;
  "lib/images": typeof lib_images;
  "lib/inventory": typeof lib_inventory;
  "lib/openAiUtils": typeof lib_openAiUtils;
  "lib/prompts/abilitiesPromptContent": typeof lib_prompts_abilitiesPromptContent;
  "lib/prompts/characterGenerationPrompts": typeof lib_prompts_characterGenerationPrompts;
  "lib/prompts/initialPrompts": typeof lib_prompts_initialPrompts;
  "lib/prompts/makeCharacterPortraitCaption": typeof lib_prompts_makeCharacterPortraitCaption;
  "lib/prompts/playersPromptContent": typeof lib_prompts_playersPromptContent;
  "lib/prompts/roomEventPrompts": typeof lib_prompts_roomEventPrompts;
  "lib/roomHelpers": typeof lib_roomHelpers;
  "lib/validators": typeof lib_validators;
  messages: typeof messages;
  players: typeof players;
  rooms: typeof rooms;
  summaries: typeof summaries;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
