import axios from "axios";
import { z } from "zod";
import { WebError } from "../WebError";
import { getStabilityKey } from "../utils/envUtils";

const apiHost = process.env.API_HOST ?? "https://api.stability.ai";

const stabilityResponseSchema = z.object({
  artifacts: z
    .object({
      base64: z.string(),
      finishReason: z.string(),
      seed: z.number(),
    })
    .array(),
});

export interface StabilityPrompt {
  text: string;
  weight?: number;
}

type ClipGuidancePreset =
  | "FAST_BLUE"
  | "FAST_GREEN"
  | "NONE"
  | "SIMPLE"
  | "SLOW"
  | "SLOWER"
  | "SLOWEST";

type StylePrompt =
  | "3d-model"
  | "analog-film"
  | "anime"
  | "cinematic"
  | "comic-book"
  | "digital-art"
  | "enhance"
  | "fantasy-art"
  | "isometric"
  | "line-art"
  | "low-poly"
  | "modeling-compound"
  | "neon-punk"
  | "origami"
  | "photographic"
  | "pixel-art"
  | "tile-texture";

type EngineId =
  | "stable-diffusion-v1"
  | "stable-diffusion-v1-5"
  | "stable-diffusion-512-v2-0"
  | "stable-diffusion-768-v2-0"
  | "stable-diffusion-512-v2-1"
  | "stable-diffusion-768-v2-1"
  | "stable-diffusion-xl-beta-v2-2-2"
  | "stable-inpainting-v1-0"
  | "stable-inpainting-512-v2-0"
  | "esrgan-v1-x2plus"
  | "stable-diffusion-x4-latent-upscaler";

export interface StabilityOptions {
  cfg_scale?: number;
  clip_guidance_preset?: ClipGuidancePreset;
  height?: 512 | 768;
  width?: 512 | 768;
  steps?: 10 | 15 | 20 | 25 | 30 | 35 | 40 | 45 | 50;
  style_prompt?: StylePrompt;
}

const defaultOptions: StabilityOptions = {
  cfg_scale: 7,
  // clip_guidance_preset: "FAST_BLUE",
  height: 512,
  width: 512,
  steps: 30,
};

export async function getImageFromStability(
  prompts: StabilityPrompt[],
  options: StabilityOptions = {}
): Promise<ArrayBuffer> {
  const engineId: EngineId = "stable-diffusion-xl-beta-v2-2-2";
  const textPromps = [
    ...prompts.map((p) => ({ text: p.text, weight: p.weight ?? 1 })),
    {
      text: "nsfw",
      weight: -0.5,
    },
  ];
  console.log(`[generateImage] Getting image from stability.ai...`);
  const response = await axios.post<ArrayBuffer>(
    `${apiHost}/v1/generation/${engineId}/text-to-image`,
    {
      text_prompts: textPromps,
      ...defaultOptions,
      ...options,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "image/png",
        Authorization: `Bearer ${getStabilityKey()}`,
      },
      responseType: "arraybuffer",
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

  return response.data;

  // const parseResult = stabilityResponseSchema.safeParse(response.data);
  // if (!parseResult.success) {
  //   console.error(
  //     `[generateImage] statbility returned malformed response: ${parseResult.error.message}`
  //   );
  //   throw new WebError("Stability returned malformed response", 500);
  // }
  // if (parseResult.data.artifacts[0].finishReason === "CONTENT_FILTER") {
  //   console.warn("Stability filtered content");
  // }
  // return Buffer.from(parseResult.data.artifacts[0].base64, "base64");
}
