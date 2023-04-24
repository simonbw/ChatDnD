import { z } from "zod";
import { characterSchema } from "../models/characterModel";
import { pronounsEnum } from "../models/pronouns";
import { playerSchema } from "../models/playerModel";

export const joinRoomRequestSchema = playerSchema;
export const joinRoomResponseSchema = z.void();
