import { Router } from "express";
import { z } from "zod";
import { routes } from "../../../common/routes";
import { roomHtml } from "../../pages/roomHtml";
import { getRoom } from "../../roomStore";

const router = Router();
export default router;

router.get(routes.room.view(":roomId"), (req, res) => {
  const roomId = z.string().parse(req.params.roomId);
  res.send(roomHtml(roomId, getRoom(roomId).getPublicState()));
});

router.get(routes.room.state(":roomId"), (req, res) => {
  const roomId = z.string().parse(req.params.roomId);
  res.send(getRoom(roomId).getPublicState());
});

router.get(routes.room.stateStream(":roomId"), (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  });
  const roomId = z.string().parse(req.params.roomId);

  res.write(`data: ${JSON.stringify(getRoom(roomId).getPublicState())}\n\n`);

  const listenerId = getRoom(roomId).channel.subscribe((data) => {
    return res.write(`data: ${JSON.stringify(data)}\n\n`);
  });

  req.on("close", () => {
    getRoom(roomId).channel.unsubscribe(listenerId);
  });
});

// router.get("/:roomId/messages", (req, res) => {
//   const roomId = z.string().parse(req.params.roomId);
//   res.send(getRoom(roomId).getPublicState().messages);
// });

// router.get("/:roomId/messages/:messageIdx", (req, res) => {
//   const roomId = z.string().parse(req.params.roomId);
//   const messageIdx = z.coerce.number().parse(req.params.messageIdx);
//   const message = getRoom(roomId).getPublicState().messages[messageIdx];
//   if (message) {
//     res.send(message);
//   } else {
//     res.status(404).send();
//   }
// });

// router.get("/:roomId/messages/:messageIdx/images", (req, res) => {
//   const roomId = z.string().parse(req.params.roomId);
//   const messageIdx = z.coerce.number().parse(req.params.messageIdx);
//   const message = getRoom(roomId).getPublicState().messages[messageIdx];

//   if (message) {
//     res.send(message.images);
//   } else {
//     res.status(404).send();
//   }
// });

// router.get(
//   "/:roomId/messages/:messageIdx/images/:imageIdx",
//   async (req, res) => {
//     const roomId = z.string().parse(req.params.roomId);
//     const messageIdx = z.coerce.number().parse(req.params.messageIdx);
//     const imageIdx = z.coerce.number().parse(req.params.imageIdx);
//     const message = getRoom(roomId).getPublicState().messages[messageIdx];
//     const image = message?.images?.[imageIdx];

//     if (image) {
//       res.send(image);
//     } else {
//       res.status(404).send();
//     }
//   }
// );
