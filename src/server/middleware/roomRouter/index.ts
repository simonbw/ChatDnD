import { Router } from "express";
import roomActions from "./roomActions";
import roomState from "./roomState";

const router = Router();
router.use("/", roomState);
router.use("/", roomActions);
export default router;
