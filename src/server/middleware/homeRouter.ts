import axios from "axios";
import { Router } from "express";
import { homeHtml } from "../pages/homeHtml";
import { z } from "zod";

const router = Router();
export default router;

router.get("/", (req, res) => {
  res.send(homeHtml);
});

router.get("/config", (req, res) => {
  res.send({
    status: "ok",
  });
});
