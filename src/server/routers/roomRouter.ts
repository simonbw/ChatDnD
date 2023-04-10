import { Router } from "express";
import { z } from "zod";
import { RoomMessage } from "../../common/roomModel";
import { roomHtml } from "../pages/roomHtml";
import { getRoom } from "../rooms";

const router = Router();
export default router;

router.get("/:roomId/", (req, res) => {
  const roomId = z.string().parse(req.params.roomId);

  console.log("getting room ", roomId, req.url);

  res.send(roomHtml(roomId, getRoom(roomId).state));
});

router.get("/:roomId/state", (req, res) => {
  const roomId = z.string().parse(req.params.roomId);
  res.send(getRoom(roomId).state);
});

router.get("/:roomId/state-stream", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  });

  const roomId = z.string().parse(req.params.roomId);
  const listenerId = getRoom(roomId).channel.subscribe((data) => {
    console.log("sending data", data);
    return res.write(`data: ${JSON.stringify(data)}\n\n`);
  });

  req.on("close", () => {
    console.log("closing stream");
    getRoom(roomId).channel.unsubscribe(listenerId);
  });
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
});
