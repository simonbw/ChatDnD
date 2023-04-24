import { Router } from "express";
import { z } from "zod";
import { routes } from "../../common/routes";
import { getDrawnImage } from "../image-generation/getDrawnImage";
import { DrawingStyle } from "../image-generation/DrawingStyle";
import { homeHtml } from "../pages/homeHtml";
import { testHtml } from "../pages/testHtml";
import { validateRequestQuery } from "./zodMiddleware";

const router = Router();
export default router;

router.get(routes.home(), (req, res) => {
  res.send(homeHtml);
});

router.get(routes.test(), (req, res) => {
  res.send(testHtml);
});

router.get(routes.healthcheck(), (req, res) => {
  res.send({
    status: "ok",
    env: { ...process.env },
  });
});

router.get(
  "/dalle",
  validateRequestQuery(z.object({ prompt: z.string() })),
  async (req, res) => {
    const url = await getDrawnImage(req.query.prompt, DrawingStyle.Plain);
    res.redirect(url);
  }
);
