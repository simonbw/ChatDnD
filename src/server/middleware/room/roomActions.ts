import { Router } from "express";
import { joinRoomRequestSchema } from "../../../common/api-schemas/roomApiSchemas";
import {
  messageRequestSchema,
  withRoomIdSchema,
} from "../../../common/models/apiSchemas";
import { RoomMessage } from "../../../common/models/roomModel";
import { routes } from "../../../common/routes";
import { isAxiosError } from "../../utils/isAxiosError";
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
    room.addPlayer(req.body);
    res.send();
  }
);

// Send a message
router.post(
  routes.room.message(":roomId"),
  validateRequest({
    body: messageRequestSchema,
    params: withRoomIdSchema,
  }),
  withRoom(),
  async (req, res, next) => {
    const room = req.params.room;

    const { playerId, content, whispered } = req.body;
    const player = room.getPlayer(playerId);

    if (!player) {
      return res
        .status(403)
        .send({ message: "You need to join this room first" });
    }

    const message: RoomMessage = {
      content: content,
      whispered: whispered,
      name: player.character.name,
      role: "user",
      createdAt: new Date().toISOString(),
    };

    console.log("adding message", message);

    room.addMessage(message);

    if (!whispered) {
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
          } else {
            console.error("Error getting DM message:", error);
            return;
          }
        });
      } catch (error) {
        return next(error);
      }
    }

    res.status(200).send({ success: true });
  }
);
