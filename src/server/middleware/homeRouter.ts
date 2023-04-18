import { Router } from "express";
import { routes } from "../../common/routes";
import { homeHtml } from "../pages/homeHtml";
import { testHtml } from "../pages/testHtml";
import { getNextRoom, listRooms } from "../roomStore";

const router = Router();
export default router;

router.get(routes.home(), (req, res) => {
  res.send(homeHtml);
});

router.get(routes.test(), (req, res) => {
  res.send(testHtml);
});

router.post(routes.room.new(), (req, res, next) => {
  const room = getNextRoom();
  res.redirect(routes.room.view(room.id));
});

router.get(routes.healthcheck(), (req, res) => {
  res.send({
    status: "ok",
  });
});
