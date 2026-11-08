import { v } from "convex/values";

/*
 * Convex validators mirroring the Zod models in `src/common/models/`.
 * Keep the two in sync: the Zod schemas type the client, these validate
 * arguments and documents on the server.
 */

export const pronounsValidator = v.union(
  v.literal("He/Him"),
  v.literal("She/Her"),
  v.literal("They/Them"),
  v.literal("It/Its")
);

export const raceValidator = v.union(
  v.literal("Human"),
  v.literal("Elf"),
  v.literal("Dwarf"),
  v.literal("Halfling")
);

export const classValidator = v.union(
  v.literal("Fighter"),
  v.literal("Ranger"),
  v.literal("Rogue"),
  v.literal("Cleric"),
  v.literal("Mage")
);

export const inventoryItemValidator = v.object({
  name: v.string(),
  description: v.string(),
  quantity: v.number(),
  imageUrl: v.optional(v.string()),
});

export const portraitValidator = v.object({
  caption: v.string(),
  url: v.string(),
});

export const characterValidator = v.object({
  name: v.string(),
  pronouns: pronounsValidator,
  race: raceValidator,
  characterClass: classValidator,
  description: v.string(),
  background: v.string(),
  portrait: v.optional(portraitValidator),
  inventory: v.array(inventoryItemValidator),
});

/** A player as the client sends it when joining. `id` is the client-generated player id. */
export const playerValidator = v.object({
  id: v.string(),
  name: v.string(),
  pronouns: pronounsValidator,
  character: characterValidator,
});

export const messageRoleValidator = v.union(
  v.literal("system"),
  v.literal("user"),
  v.literal("assistant")
);

export const messageImageValidator = v.object({
  description: v.string(),
  url: v.optional(v.string()),
});

export const messageActionValidator = v.object({
  name: v.string(),
  args: v.array(v.string()),
});
