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
  /* Who is saying this, i.e. a user, the dm, or the system */
  role: roomMessageRoleSchema,
  /* Content of the message */
  content: z.string().nonempty(),
  /* Alternate content to display to users */
  publicContent: z.string().optional(),
  /** ISO string of the time this message was created */
  createdAt: z.string().nonempty(),
  /* Name of the person who said this */
  name: z.string().nonempty().optional(),
  /* Not said to the DM */
  secret: z.boolean().optional(),
  /* References to images included in this message */
  images: z.array(roomMessageImageSchema).optional(),
});

export const roomStateSchema = z.object({
  messages: z.array(roomMessageSchema),
  id: z.string(),
  name: z.string(),
  players: z.array(z.string()),
  createdAt: z.string(),
});

export type RoomMessageImage = z.infer<typeof roomMessageImageSchema>;
export type RoomMessage = z.infer<typeof roomMessageSchema>;
export type RoomState = z.infer<typeof roomStateSchema>;
