import { z } from "zod";

export const withRoomIdSchema = z.object({ roomId: z.string().nonempty() });

export const genericResponseSchema = z.object({ success: z.boolean() });
