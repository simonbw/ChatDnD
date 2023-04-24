import axios from "axios";
import { Router } from "express";
import { Readable } from "stream";
import { z } from "zod";
import { routes } from "../../common/routes";
import { getElevenLabsKey } from "../utils/envUtils";
import { validateRequestBody } from "./zodMiddleware";

const router = Router();
export default router;

// TODO: Cache this stuff.

router.post(
  routes.textToSpeech(),
  validateRequestBody(z.string()),
  async (req, res) => {
    try {
      // Request the audio stream from the provided URL
      const response = await axios.post<Readable>(
        "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM/stream",
        {
          text: req.body,
          voice_settings: {
            stability: 0.7,
            similarity_boost: 0.75,
          },
        },
        {
          headers: {
            "xi-api-key": getElevenLabsKey(),
            "Content-Type": "application/json",
          },
          responseType: "stream",
        }
      );

      // Set the appropriate headers based on the response from the API
      if (response.headers["content-type"]) {
        res.setHeader("Content-Type", response.headers["content-type"]);
      }
      if (response.headers["content-length"]) {
        res.setHeader("Content-Length", response.headers["content-length"]);
      }
      if (response.headers["content-disposition"]) {
        res.setHeader(
          "Content-Disposition",
          response.headers["content-disposition"]
        );
      }

      // Forward the audio stream to the client
      response.data.pipe(res);

      // Close the connection when the client disconnects
      req.on("close", () => {
        response.data.destroy();
        res.end();
      });
    } catch (error) {
      console.error("Error while forwarding audio stream:", error);
      res.status(500).send("Error while forwarding audio stream.");
    }
  }
);
