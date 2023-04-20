import { Router } from "express";
import { z } from "zod";
import {
  RoomMessage,
  roomMessageSchema,
} from "../../../common/models/roomModel";
import { routes } from "../../../common/routes";
import { getRoom } from "../../roomStore";
import { isAxiosError } from "../../utils/isAxiosError";

const router = Router();
export default router;

// Join a room
router.post(routes.room.join(":roomId"), (req, res, next) => {
  const roomId = z.string().parse(req.params.roomId);
  console.log("player joining room ", roomId, req.url);

  const room = getRoom(roomId);

  const maybePlayer = z
    .object({ name: z.string(), id: z.string() })
    .safeParse(req.body);

  if (!maybePlayer.success) {
    console.log("Bad Player:", maybePlayer.error);
    return res.status(400).send({ error: "Invalid Player" });
  }

  try {
    const player = maybePlayer.data;
    room.addPlayer(player);
  } catch (error) {
    return next(error);
  }

  res.send({ success: true });
});

// Send a message
router.post(routes.room.message(":roomId"), async (req, res, next) => {
  const roomId = z.string().parse(req.params.roomId);
  const room = getRoom(roomId);

  const requestParseResult = z
    .object({
      playerId: z.string().nonempty(),
      content: z.string().nonempty(),
      whispered: z.boolean().optional(),
    })
    .safeParse(req.body);

  if (!requestParseResult.success) {
    return res
      .status(400)
      .send({ message: "Bad message", error: requestParseResult.error });
  }

  const requestBody = requestParseResult.data;
  const player = room.getPlayer(requestBody.playerId);

  if (!player) {
    return res
      .status(403)
      .send({ message: "You need to join this room first" });
  }

  const message: RoomMessage = {
    content: requestBody.content,
    whispered: requestBody.whispered,
    name: player.name,
    role: "user",
    createdAt: new Date().toISOString(),
  };

  console.log("adding message", message);

  room.addMessage(message);

  if (!requestBody.whispered) {
    try {
      room.getDmMessage().catch((error: unknown) => {
        if (isAxiosError(error)) {
          console.error("Error getting DM message", {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            responseData: error.response?.data,
            messages: room.getApiMessages(),
          });
          return;
        }
        return console.error("Error getting DM message:", error);
      });
    } catch (error) {
      return next(error);
    }
  }

  res.status(200).send({ success: true });
});
