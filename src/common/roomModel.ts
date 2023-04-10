import { z } from "zod";

export const roomMessageSchema = z.object({
  role: z.union([
    z.literal("system"),
    z.literal("user"),
    z.literal("assistant"),
  ]),
  content: z.string(),
  name: z.string().optional(),
  secret: z.boolean().optional(),
});

export const roomStateSchema = z.object({
  messages: z.array(roomMessageSchema),
});

export type RoomMessage = z.infer<typeof roomMessageSchema>;
export type RoomState = z.infer<typeof roomStateSchema>;
