import { z } from "zod";

export const roomMessageRoleSchema = z.union([
  z.literal("system"),
  z.literal("user"),
  z.literal("assistant"),
]);

export const roomMessageImageSchema = z.object({
  description: z.string(),
  url: z.string().optional(),
});

export const roomMessageSchema = z.object({
  role: roomMessageRoleSchema,
  content: z.string(),
  name: z.string().optional(),
  secret: z.boolean().optional(),
  images: z.array(roomMessageImageSchema).optional(),
});

export const roomStateSchema = z.object({
  messages: z.array(roomMessageSchema),
});

export type RoomMessageImage = z.infer<typeof roomMessageImageSchema>;
export type RoomMessage = z.infer<typeof roomMessageSchema>;
export type RoomState = z.infer<typeof roomStateSchema>;
