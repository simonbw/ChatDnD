import type { ActionCtx } from "../_generated/server";
import { getStabilityKey, isDrawingEnabled } from "./env";

/** Shown in place of drawings when drawing is disabled or fails. */
export const PLACEHOLDER_IMAGE_URL = "/static/images/drawing-disabled.png";

const STABILITY_ENDPOINT =
  "https://api.stability.ai/v2beta/stable-image/generate/core";

type StylePreset =
  | "analog-film"
  | "comic-book"
  | "digital-art"
  | "enhance"
  | "fantasy-art"
  | "line-art";

interface DrawOptions {
  negativePrompt?: string;
  stylePreset?: StylePreset;
}

/**
 * Draws an image with Stability AI, stores it in Convex file storage, and
 * returns its public URL. Returns the placeholder when drawing is disabled
 * or the request fails, so callers always get something to show.
 */
export async function drawImage(
  ctx: ActionCtx,
  prompt: string,
  options: DrawOptions = {}
): Promise<string> {
  if (!isDrawingEnabled()) {
    return PLACEHOLDER_IMAGE_URL;
  }

  try {
    const form = new FormData();
    form.append("prompt", prompt);
    form.append("negative_prompt", options.negativePrompt ?? "nsfw");
    form.append("aspect_ratio", "1:1");
    form.append("output_format", "webp");
    if (options.stylePreset) {
      form.append("style_preset", options.stylePreset);
    }

    console.log(`[drawImage] "${prompt}"`);
    const response = await fetch(STABILITY_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getStabilityKey()}`,
        Accept: "image/*",
      },
      body: form,
    });

    if (!response.ok) {
      throw new Error(
        `Stability returned ${response.status}: ${await response.text()}`
      );
    }

    const storageId = await ctx.storage.store(await response.blob());
    const url = await ctx.storage.getUrl(storageId);
    if (!url) {
      throw new Error("Stored image has no URL");
    }
    return url;
  } catch (error) {
    console.error("[drawImage] failed:", error);
    return PLACEHOLDER_IMAGE_URL;
  }
}

export function drawStoryCharacter(ctx: ActionCtx, description: string) {
  return drawImage(
    ctx,
    `Charcoal sketch, character portrait, white background, ${description}`
  );
}

export function drawStoryScene(ctx: ActionCtx, description: string) {
  return drawImage(
    ctx,
    `sketch, white background, fantasy art, dungeons and dragons, ${description}`
  );
}

export function drawPortrait(ctx: ActionCtx, description: string) {
  return drawImage(
    ctx,
    `sketch, white background, fantasy art, dungeons and dragons, ${description}`
  );
}

export function drawInventoryItem(
  ctx: ActionCtx,
  item: { name: string; description: string }
) {
  return drawImage(
    ctx,
    `${item.name} alone on white background, lots of whitespace, pencil drawing, ${item.description}`,
    { negativePrompt: "nsfw, man, woman, person", stylePreset: "fantasy-art" }
  );
}
