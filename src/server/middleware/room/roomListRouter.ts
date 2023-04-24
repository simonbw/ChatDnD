import { Router } from "express";
import { z } from "zod";
import { routes } from "../../../common/routes";
import { createRoom, listRooms } from "../../roomStore";
import { validateRequestParams, validateRequestQuery } from "../zodMiddleware";

const router = Router();
export default router;

router.get(
  routes.rooms(),
  validateRequestQuery(z.object({ playerId: z.string().optional() })),
  (req, res) => {
    const playerId = req.query.playerId;
    res.send({ rooms: listRooms(playerId) });
  }
);

router.post(routes.room.new(), async (req, res) => {
  const room = await createRoom();
  return res.redirect(routes.room.view(room.id));
});
