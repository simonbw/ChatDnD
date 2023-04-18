import { Router } from "express";
import roomList from "./roomListRouter";
import roomActions from "./roomActions";
import roomState from "./roomState";

const router = Router();
router.use(roomList);
router.use(roomState);
router.use(roomActions);
export default router;
