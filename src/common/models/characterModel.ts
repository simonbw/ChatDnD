import { z } from "zod";
import { characterClassEnum } from "./characterClassEnum";
import { characterRaceEnum } from "./characterRaceEnum";
import { pronounsEnum } from "./pronouns";

const inventoryItemSchema = z.object({
  name: z.string(),
  description: z.string(),
  quantity: z.number(),
  imageUrl: z.string().optional(),
});

export type InventoryItem = z.infer<typeof inventoryItemSchema>;

export const characterSchema = z.object({
  name: z.string(),
  pronouns: pronounsEnum,
  race: characterRaceEnum,
  characterClass: characterClassEnum,
  description: z.string(),
  background: z.string(),
  portrait: z
    .object({
      caption: z.string(),
      url: z.string(),
    })
    .optional(),
  inventory: z.array(inventoryItemSchema),
});

export type Character = z.infer<typeof characterSchema>;
