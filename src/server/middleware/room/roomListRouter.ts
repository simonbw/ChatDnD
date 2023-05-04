import { Router } from "express";
import { z } from "zod";
import { routes } from "../../../common/routes";
import { getDb } from "../../db";
import { RoomStore, roomTable } from "../../room/roomStore";
import { validateRequestQuery } from "../zodMiddleware";

const router = Router();
export default router;

router.get(
  routes.rooms(),
  validateRequestQuery(z.object({ playerId: z.string().optional() })),
  (req, res) => {
    const rooms = RoomStore.instance.getRooms({ playerId: req.query.playerId });
    res.send({ rooms });
  }
);

router.post(routes.room.new(), async (req, res) => {
  const room = await RoomStore.instance.createRoom();
  return res.redirect(routes.room.view(room.id));
});

router.get(routes.clearAllRooms(), async (req, res) => {
  const result = await roomTable.delete().run(await getDb());
  RoomStore.instance.clear();
  res.send(result);
});
