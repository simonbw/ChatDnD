import { messageRequestSchema } from "../api-schemas/roomApiSchemas";
import { z } from "zod";

export const withRoomIdSchema = z.object({ roomId: z.string().nonempty() });

export { messageRequestSchema };
