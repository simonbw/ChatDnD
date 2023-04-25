import { Router } from "express";
import { z } from "zod";
import { routes } from "../../common/routes";
import { DrawingStyle } from "../image-generation/DrawingStyle";
import { generateImage } from "../image-generation/generateImage";
import { basicHtml } from "../pages/pageHtml";
import { validateRequestBody } from "./zodMiddleware";

const router = Router();
export default router;

router.get(routes.home(), (req, res) => {
  res.send(basicHtml({ scripts: ["/static/pages/homePage.js"] }));
});

router.get(routes.test(), (req, res) => {
  res.send(basicHtml({ scripts: ["/static/pages/testPage.js"] }));
});

router.get(routes.healthcheck(), (req, res) => {
  res.send({
    status: "ok",
    env: { ...process.env },
  });
});

router.get("/dalle", async (req, res) => {
  res.send(basicHtml({ scripts: ["/static/pages/dallePage.js"] }));
});

router.post(
  "/dalle",
  validateRequestBody(z.object({ prompt: z.string() })),
  async (req, res) => {
    const url = await generateImage(req.body.prompt, DrawingStyle.Plain, false);
    res.send({ url });
  }
);
