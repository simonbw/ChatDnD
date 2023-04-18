import { Router } from "express";
import { routes } from "../../../common/routes";
import { listRooms } from "../../roomStore";
import { z } from "zod";

const router = Router();
export default router;

router.get(routes.rooms(), (req, res) => {
  const playerId = z.string().optional().parse(req.query.playerId);
  res.send({ rooms: listRooms(playerId) });
});
