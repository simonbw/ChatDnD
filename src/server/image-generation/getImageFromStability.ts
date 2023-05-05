import axios from "axios";
import { z } from "zod";
import { timed } from "../../client/utils/timeLogger";
import { WebError } from "../WebError";
import { getStabilityKey } from "../utils/envUtils";

const engineId = "stable-diffusion-v1-5";
const apiHost = process.env.API_HOST ?? "https://api.stability.ai";

const responseSchema = z.object({
  artifacts: z
    .object({
      base64: z.string(),
      finishReason: z.string(),
      seed: z.number(),
    })
    .array(),
});

export const getImageFromStability = timed(
  "getImageFromStability",
  async (prompt: string): Promise<ArrayBuffer> => {
    console.log(`[generateImage] Getting image from stability.ai...`);
    const response = await axios.post<ArrayBuffer>(
      `${apiHost}/v1/generation/${engineId}/text-to-image`,
      {
        text_prompts: [
          {
            text: prompt,
            weight: 1,
          },
          {
            text: "nsfw",
            weight: -0.5,
          },
        ],
        cfg_scale: 7,
        clip_guidance_preset: "FAST_BLUE",
        height: 512,
        width: 512,
        samples: 1,
        steps: 30,
        style_prompt: "fantasy-art",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${getStabilityKey()}`,
        },
        responseType: "json",
      }
    );

    if (response.status !== 200) {
      console.error(
        "[generateImage] Error getting image from Stability:" +
          response.statusText
      );
      throw new WebError(
        "Error getting image from Stability:" + response.statusText,
        response.status
      );
    }

    const parseResult = responseSchema.safeParse(response.data);

    if (!parseResult.success) {
      console.error(
        `[generateImage] statbility returned malformed response: ${parseResult.error.message}`
      );
      throw new WebError("Stability returned malformed response", 500);
    }

    if (parseResult.data.artifacts[0].finishReason === "CONTENT_FILTER") {
      console.warn("Stability filtered content");
    }

    return Buffer.from(parseResult.data.artifacts[0].base64, "base64");
  }
);
