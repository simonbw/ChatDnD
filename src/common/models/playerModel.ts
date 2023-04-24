import { z } from "zod";
import { characterSchema } from "./characterModel";
import { pronounsEnum } from "./pronouns";

export const playerSchema = z.object({
  id: z.string(),
  name: z.string(),
  pronouns: pronounsEnum,
  character: characterSchema,
});
export type Player = z.infer<typeof playerSchema>;
