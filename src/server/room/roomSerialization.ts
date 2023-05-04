import { z } from "zod";
import { playerSchema } from "../../common/models/playerModel";
import { roomMessageSchema } from "../../common/models/roomModel";

export const roomSaveSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  players: z.array(playerSchema),
  messages: z.array(roomMessageSchema),
  gameMaster: z.object({}).optional(),
  summaryHistory: z.record(z.string()).optional(),
});
export type SerializedRoom = z.infer<typeof roomSaveSchema>;
export type RoomId = string;
