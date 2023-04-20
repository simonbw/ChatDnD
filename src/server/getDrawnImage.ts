import axios from "axios";
import path from "path";
import sharp, { Sharp } from "sharp";
import { last } from "../common/utils/arrayUtils";
import { getDrawnImageFolder, isDrawingEnabled } from "./utils/envUtils";
import { openAi } from "./utils/openAiUtils";

const PLACEHOLDER = "/static/images/drawing-disabled.png";

export async function getDrawnImage(
  description: string,
  processPrompt = true
): Promise<string> {
  if (isDrawingEnabled()) {
    const prompt = processPrompt
      ? `A medieval painting on a white backround. The drawing is of "${description}"`
      : description;
    const remoteImageUrl = await getRemoteUrl(prompt);
    const imageName = last(new URL(remoteImageUrl).pathname.split("/"));
    const rawBuffer = await fetchImageBuffer(remoteImageUrl);
    const processedBuffer = await processImage(rawBuffer);
    saveToFile(processedBuffer, imageName);

    const localUrl = `/static/images/drawn/${imageName}`;
    return localUrl;
  } else {
    return PLACEHOLDER;
  }
}

async function getRemoteUrl(prompt: string): Promise<string> {
  console.log(`drawing image with prompt: ${prompt}`);
  const apiResponse = await openAi().createImage({
    prompt: prompt,
    n: 1,
    response_format: "url",
    size: "512x512",
  });
  const url = apiResponse.data.data[0].url!;
  if (!url) {
    throw new WebError("Failed to draw image", 500);
  }
  return url;
}

async function fetchImageBuffer(url: string): Promise<ArrayBuffer> {
  console.log(`fetching image from ${url}`);
  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });

  return Buffer.from(response.data);
}

async function processImage(buffer: ArrayBuffer): Promise<Sharp> {
  const mainImage = sharp(buffer);
  const lightness = mainImage.clone().bandbool("or").linear(1).negate();

  return mainImage
    .removeAlpha()
    .toColorspace("rgb")
    .joinChannel(await lightness.toBuffer(), {});
}

async function saveToFile(buffer: Sharp, imageName: string): Promise<void> {
  const imagePath = path.join(getDrawnImageFolder(), imageName);
  console.log(`saving to ${imagePath}`);
  await buffer.toFile(imagePath);
}
