import path from "path";
import sharp, { Sharp } from "sharp";
import { last } from "../../common/utils/arrayUtils";
import { getDrawnImageFolder, isDrawingEnabled } from "../utils/envUtils";
import { DrawingStyle, createDrawingPrompt } from "./DrawingStyle";
import { s3Client } from "./s3";
import { getImageFromDalle } from "./getImageFromDalle";
import { fetchImageBuffer } from "./fetchImageBuffer";
import { removeBackground } from "./removeBackground";

const PLACEHOLDER = "/static/images/drawing-disabled.png";

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

    await saveToFile(processedBuffer, imageName);

    return `/static/images/drawn/${imageName}`;

    // return saveToS3(processedBuffer, imageName);
  } else {
    return PLACEHOLDER;
  }
}

async function saveToFile(buffer: Sharp, imageName: string): Promise<void> {
  const imagePath = path.join(getDrawnImageFolder(), imageName);
  console.log(`saving to ${imagePath}`);
  await buffer.toFile(imagePath);
}

async function saveToS3(sharp: Sharp, imageName: string): Promise<string> {
  console.log("Saving to S3");
  const buffer = await sharp.png({ force: true }).toBuffer();
  const response = await s3Client
    .upload({
      Bucket: process.env.AWS_BUCKET_NAME ?? "",
      Key: imageName,
      Body: buffer,
    })
    .promise();
  console.log("S3 Response:", response);
  return response.Location;
}
