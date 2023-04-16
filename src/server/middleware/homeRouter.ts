import { Router } from "express";
import { homeHtml } from "../pages/homeHtml";
import { listRooms } from "../rooms";

const router = Router();
export default router;

router.get("/", (req, res) => {
  res.send(homeHtml);
});

router.get("/rooms", (req, res) => {
  res.send({ rooms: listRooms() });
});

router.get("/config", (req, res) => {
  res.send({
    status: "ok",
  });
});
