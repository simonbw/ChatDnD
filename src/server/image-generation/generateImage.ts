import path from "path";
import sharp, { Sharp } from "sharp";
import { last } from "../../common/utils/arrayUtils";
import { getDrawnImageFolder, isDrawingEnabled } from "../utils/envUtils";
import { DrawingStyle, createDrawingPrompt } from "./DrawingStyle";
import { fetchImageBuffer } from "./fetchImageBuffer";
import { getImageFromDalle } from "./getImageFromDalle";
import { removeBackground } from "./removeBackground";
import { saveToS3 } from "./saveToS3";

const PLACEHOLDER_IMAGE_URL = "/static/images/drawing-disabled.png";

export async function generateImage(
  description: string,
  drawingStyle = DrawingStyle.Plain,
  shouldRemoveBackground = true
): Promise<string> {
  if (isDrawingEnabled()) {
    const prompt = createDrawingPrompt(description, drawingStyle);
    const remoteImageUrl = await getImageFromDalle(prompt);
    const imageName = last(new URL(remoteImageUrl).pathname.split("/"));
    const rawBuffer = await fetchImageBuffer(remoteImageUrl);
    const processedBuffer = shouldRemoveBackground
      ? await removeBackground(rawBuffer)
      : sharp(rawBuffer);

    if (process.env.DRAWING_SAVE_TARGET === "s3") {
      return saveToS3(processedBuffer, imageName);
    } else {
      return await saveToFile(processedBuffer, imageName);
    }
  } else {
    return PLACEHOLDER_IMAGE_URL;
  }
}

async function saveToFile(buffer: Sharp, imageName: string): Promise<string> {
  const imagePath = path.join(getDrawnImageFolder(), imageName);
  console.log(`saving to ${imagePath}`);
  await buffer.toFile(imagePath);
  return `/static/images/drawn/${imageName}`;
}
