import { Router } from "express";
import { z } from "zod";
import {
  RoomMessage,
  roomMessageSchema,
} from "../../../common/models/roomModel";
import { getRoom } from "../../rooms";

const router = Router();
export default router;

router.post("/:roomId/join", (req, res, next) => {
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

router.post("/:roomId/message", async (req, res, next) => {
  const roomId = z.string().parse(req.params.roomId);
  const room = getRoom(roomId);

  const requestBody = roomMessageSchema.safeParse(req.body);

  if (!requestBody.success) {
    return res.status(400).send({ error: "Bad message: " + String(req.body) });
  }

  const message: RoomMessage = {
    role: "user",
    name: requestBody.data.name,
    content: requestBody.data.content,
    secret: requestBody.data.secret ?? false,
  };

  try {
    room.addMessage(message);
  } catch (error) {
    return next(error);
  }

  if (!requestBody.data.secret) {
    try {
      room
        .getDmMessage()
        .catch((error) => console.error("Error getting DM message:", error));
    } catch (error) {
      return next(error);
    }
  }

  res.status(200).send({ success: true });
});
