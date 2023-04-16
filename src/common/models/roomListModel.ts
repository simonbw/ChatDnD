import { z } from "zod";

export const roomListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  players: z.number(),
});

export const roomListSchema = z.array(roomListItemSchema);

export type RoomListItem = z.infer<typeof roomListItemSchema>;
export type RoomList = z.infer<typeof roomListSchema>;
