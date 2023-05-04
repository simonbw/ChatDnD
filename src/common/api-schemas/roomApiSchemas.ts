import { z } from "zod";
import { playerSchema } from "../models/playerModel";

export const joinRoomRequestSchema = playerSchema;
export const joinRoomResponseSchema = z.void();

export const messageRequestSchema = z.object({
  playerId: z.string().nonempty(),
  content: z.string().nonempty(),
  whispered: z.boolean().optional(),
});

export const withRoomIdSchema = z.object({ roomId: z.string().nonempty() });
