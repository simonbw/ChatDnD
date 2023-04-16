import axios from "axios";
import { Router } from "express";
import { z } from "zod";
import { roomHtml } from "../../pages/roomHtml";
import { getRoom } from "../../rooms";

const router = Router();
export default router;

router.get("/:roomId/", (req, res) => {
  const roomId = z.string().parse(req.params.roomId);

  console.log("getting room ", roomId, req.url);

  res.send(roomHtml(roomId, getRoom(roomId).getPublicState()));
});

router.get("/:roomId/state", (req, res) => {
  const roomId = z.string().parse(req.params.roomId);
  res.send(getRoom(roomId).getPublicState());
});

router.get("/:roomId/messages", (req, res) => {
  const roomId = z.string().parse(req.params.roomId);
  res.send(getRoom(roomId).getPublicState().messages);
});

router.get("/:roomId/messages/:messageIdx", (req, res) => {
  const roomId = z.string().parse(req.params.roomId);
  const messageIdx = z.coerce.number().parse(req.params.messageIdx);
  const message = getRoom(roomId).getPublicState().messages[messageIdx];
  if (message) {
    res.send(message);
  } else {
    res.status(404).send();
  }
});

router.get("/:roomId/messages/:messageIdx/images", (req, res) => {
  const roomId = z.string().parse(req.params.roomId);
  const messageIdx = z.coerce.number().parse(req.params.messageIdx);
  const message = getRoom(roomId).getPublicState().messages[messageIdx];

  if (message) {
    res.send(message.images);
  } else {
    res.status(404).send();
  }
});

router.get(
  "/:roomId/messages/:messageIdx/images/:imageIdx",
  async (req, res) => {
    const roomId = z.string().parse(req.params.roomId);
    const messageIdx = z.coerce.number().parse(req.params.messageIdx);
    const imageIdx = z.coerce.number().parse(req.params.imageIdx);
    const message = getRoom(roomId).getPublicState().messages[messageIdx];

    const imageUrl = message?.images?.[imageIdx]?.url;

    if (!imageUrl) {
      res.status(404).send();
      return;
    }

    try {
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });

      res.set("Content-Type", response.headers["content-type"]);
      res.set("Content-Length", response.headers["content-length"]);
      res.send(response.data);
    } catch (error) {
      res.status(404).send();
    }
  }
);

router.get("/:roomId/state-stream", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  });

  const roomId = z.string().parse(req.params.roomId);
  const listenerId = getRoom(roomId).channel.subscribe((data) => {
    return res.write(`data: ${JSON.stringify(data)}\n\n`);
  });

  req.on("close", () => {
    getRoom(roomId).channel.unsubscribe(listenerId);
  });
});
