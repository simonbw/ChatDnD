import { randomUUID } from "crypto";
import { CreateImageRequestSizeEnum } from "openai";
import sharp from "sharp";
import { isDrawingEnabled } from "../utils/envUtils";
import {
  StabilityOptions,
  StabilityPrompt,
  getImageFromStability,
} from "./getImageFromStability";
import { removeBackground } from "./removeBackground";
import { saveImageBufferToFile } from "./saveImageBufferToFile";
import { saveToS3 } from "./saveToS3";

export const PLACEHOLDER_IMAGE_URL = "/static/images/drawing-disabled.png";

export interface GenerateImageOptions {
  shouldRemoveBackground?: boolean;
  brighten?: number;
  s3Folder?: string;
  stability?: StabilityOptions;
  dalle?: { size: CreateImageRequestSizeEnum };
}

export async function generateImageStability(
  prompt: string | Array<StabilityPrompt>,
  options: GenerateImageOptions = {}
): Promise<string> {
  const {
    shouldRemoveBackground = true,
    s3Folder = "/",
    brighten = 1.1,
    stability: stabilityOptions,
  } = options;
  if (isDrawingEnabled()) {
    const imageName = s3Folder + "/" + randomUUID() + ".png";
    const prompts = typeof prompt === "string" ? [{ text: prompt }] : prompt;
    const rawArrayBuffer = await getImageFromStability(
      prompts,
      stabilityOptions
    );
    const processedBuffer = shouldRemoveBackground
      ? await removeBackground(rawArrayBuffer)
      : sharp(rawArrayBuffer).modulate({ brightness: brighten });

    const buffer = await processedBuffer
      .png({ force: true, compressionLevel: 9 })
      .toBuffer();
    if (process.env.DRAWING_SAVE_TARGET === "s3") {
      return await saveToS3(buffer, imageName);
    } else {
      return await saveImageBufferToFile(processedBuffer, imageName);
    }
  } else {
    return PLACEHOLDER_IMAGE_URL;
  }
}
