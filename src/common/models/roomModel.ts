import { z } from "zod";
import { playerSchema } from "./playerModel";

export const roomMessageRoleSchema = z.union([
  z.literal("system"),
  z.literal("user"),
  z.literal("assistant"),
]);

export const roomMessageImageSchema = z.object({
  description: z.string(),
  url: z.string().optional(),
});

export type RoomMessageImage = z.infer<typeof roomMessageImageSchema>;

export const roomActionSchema = z.object({
  name: z.string(),
  args: z.string().array(),
});

export type RoomMessageId = number;

export const roomMessageSchema = z.object({
  /** Unique identifier of this message. */
  id: z.number().optional(),
  /** Who is saying this, i.e. a user, the dm, or the system */
  role: roomMessageRoleSchema,
  /** Content of the message */
  content: z.string(),
  /** Alternate content to display to users */
  publicContent: z.string().optional(),
  /** ISO string of the time this message was created */
  createdAt: z.string().nonempty(),
  /** Name of the person who said this */
  name: z.string().nonempty().optional(),
  /** Not said to the DM */
  whispered: z.boolean().optional(),
  /** References to images included in this message */
  images: z.array(roomMessageImageSchema).optional(),
  /** Actions the GM decided to take */
  actions: z.array(roomActionSchema).optional(),
  /** Whether or not this message has been fully written */
  complete: z.boolean().optional(),
});

export type RoomMessage = z.infer<typeof roomMessageSchema>;
export type WithImages = {
  images: Exclude<RoomMessage["images"], undefined>;
};
export type WithActions = {
  actions: Exclude<RoomMessage["actions"], undefined>;
};
export type WithId = {
  id: Exclude<RoomMessage["id"], undefined>;
};

export const roomPublicStateSchema = z.object({
  messages: z.array(roomMessageSchema),
  id: z.string(),
  name: z.string(),
  players: z.array(playerSchema),
  createdAt: z.string(),
  openToJoin: z.boolean(),
});

export type RoomPublicState = z.infer<typeof roomPublicStateSchema>;
