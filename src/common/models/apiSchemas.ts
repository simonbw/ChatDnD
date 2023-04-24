import { z } from "zod";

export const withRoomIdSchema = z.object({ roomId: z.string().nonempty() });

export const messageRequestSchema = z.object({
  playerId: z.string().nonempty(),
  content: z.string().nonempty(),
  whispered: z.boolean().optional(),
});
