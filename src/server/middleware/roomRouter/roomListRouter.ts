import { Router } from "express";
import { z } from "zod";
import { routes } from "../../../common/routes";
import { createRoom, listRooms } from "../../roomStore";

const router = Router();
export default router;

router.get(routes.rooms(), (req, res) => {
  const playerId = z.string().optional().parse(req.query.playerId);
  res.send({ rooms: listRooms(playerId) });
});

router.post(routes.room.new(), async (req, res, next) => {
  const room = await createRoom();
  return res.redirect(routes.room.view(room.id));
});
