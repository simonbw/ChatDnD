import { Router } from "express";
import { routes } from "../../../common/routes";
import { basicHtml } from "../../pages/pageHtml";
import { sendEvent, startEventStream } from "../../utils/eventStreamUtils";
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
  sendEvent(res, { type: "replace", state: room.getPublicState() });

  const listenerId = room.onUpdate.subscribe((data) => {
    sendEvent(res, data);
  });

  req.on("close", () => {
    room.onUpdate.unsubscribe(listenerId);
  });
});

router.get(routes.room.json(":roomId"), withRoom(), (req, res) => {
  res.send(req.params.room.toJson());
});
