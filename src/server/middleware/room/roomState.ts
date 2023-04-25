import { Router } from "express";
import { z } from "zod";
import { routes } from "../../../common/routes";
import { basicHtml } from "../../pages/pageHtml";
import { sendEvent, startEventStream } from "../../utils/eventStreamUtils";
import { validateRequestParams } from "../zodMiddleware";
import { withRoom } from "./withRoom";

const router = Router();
export default router;

router.get(routes.room.view(":roomId"), withRoom(), (req, res) => {
  res.send(basicHtml({ scripts: ["/static/pages/roomPage.js"] }));
});

router.get(routes.room.state(":roomId"), withRoom(), (req, res) => {
  res.send(req.params.room.getPublicState());
});

router.get(routes.room.stateStream(":roomId"), withRoom(), (req, res) => {
  const room = req.params.room;

  // Start the stream
  startEventStream(res);
  sendEvent(res, room.getPublicState());

  const listenerId = room.channel.subscribe((data) => {
    sendEvent(res, data);
  });

  req.on("close", () => {
    room.channel.unsubscribe(listenerId);
  });
});

router.get("/:roomId/messages", withRoom(), (req, res) => {
  res.send(req.params.room.getPublicState().messages);
});

router.get(
  "/:roomId/messages/:messageIdx",
  validateRequestParams(z.object({ messageIdx: z.coerce.number() })),
  withRoom(),
  (req, res) => {
    const message =
      req.params.room.getPublicState().messages[req.params.messageIdx];
    if (message) {
      res.send(message);
    } else {
      res.status(404).send("Message not found in room");
    }
  }
);
