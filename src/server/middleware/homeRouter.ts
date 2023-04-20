import { Router } from "express";
import { z } from "zod";
import { routes } from "../../common/routes";
import { getDrawnImage } from "../getDrawnImage";
import { homeHtml } from "../pages/homeHtml";
import { testHtml } from "../pages/testHtml";

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
  });
});

router.get("/dalle", async (req, res) => {
  const prompt = z.string().parse(req.query.prompt);
  const url = await getDrawnImage(prompt, false);
  res.redirect(url);
});
