import axios from "axios";
import { Router } from "express";
import { z } from "zod";
import { RoomMessage } from "../../../common/models/roomModel";
import { roomHtml } from "../../pages/roomHtml";
import { getRoom } from "../../rooms";

const router = Router();
export default router;

router.post("/:roomId/join", (req, res) => {
  const roomId = z.string().parse(req.params.roomId);
  console.log("player joining room ", roomId, req.url);
  res.send(roomHtml(roomId, getRoom(roomId).getPublicState()));
});

router.post("/:roomId/message", async (req, res) => {
  const roomId = z.string().parse(req.params.roomId);
  const room = getRoom(roomId);

  const requestBody = z
    .object({
      name: z.string(),
      content: z.string(),
      secret: z.boolean().optional(),
    })
    .safeParse(req.body);

  if (!requestBody.success) {
    res.status(400);
    res.send({ error: "Bad message: " + String(req.body) });
    return;
  }

  const message: RoomMessage = {
    role: "user",
    name: requestBody.data.name,
    content: requestBody.data.content,
    secret: requestBody.data.secret ?? false,
  };

  room.addMessage(message);

  if (!requestBody.data.secret) {
    room.getDmMessage();
  }

  res.status(200).send({ success: true });
});
