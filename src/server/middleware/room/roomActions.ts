import { Router } from "express";
import {
  joinRoomRequestSchema,
  messageRequestSchema,
  redrawInventoryRequestSchema,
} from "../../../common/api-schemas/roomApiSchemas";
import { withRoomIdSchema } from "../../../common/models/apiSchemas";
import { routes } from "../../../common/routes";
import { validateRequest, validateRequestBody } from "../zodMiddleware";
import { withRoom } from "./withRoom";

const router = Router();
export default router;

// Join a room
router.post(
  routes.room.join(":roomId"),
  validateRequestBody(joinRoomRequestSchema),
  withRoom(),
  (req, res) => {
    const room = req.params.room;
    if (!room.isOpenToJoin()) {
      return res.status(403).send({ message: "This room is not open to join" });
    }

    room.players.add(req.body);
    res.status(200).send({ success: true });
  }
);

// Send a message
router.post(
  routes.room.postMessage(":roomId"),
  validateRequest({
    body: messageRequestSchema,
    params: withRoomIdSchema,
  }),
  withRoom(),
  async (req, res) => {
    const room = req.params.room;

    const { playerId, content, whispered } = req.body;
    const player = room.players.byId(playerId);

    if (!player) {
      return res
        .status(403)
        .send({ message: "You need to join this room first" });
    }

    room.messages.addMessage({
      content: content,
      whispered: whispered,
      name: player.character.name,
      role: "user",
      createdAt: new Date().toISOString(),
    });

    res.status(200).send({ success: true });
  }
);

router.get(routes.room.clearMessages(":roomId"), withRoom(), (req, res) => {
  const room = req.params.room;
  room.softReset();
  res.send({ success: true });
});

// Redraw inventory
router.post(
  routes.room.redrawInventory(":roomId"),
  validateRequestBody(redrawInventoryRequestSchema),
  withRoom(),
  async (req, res) => {
    const room = req.params.room;
    await room.players.redrawInventory(req.body.playerId);
    res.send({ success: true });
  }
);
