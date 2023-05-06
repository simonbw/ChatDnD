import sharp from "sharp";
import { last } from "../../common/utils/arrayUtils";
import { isDrawingEnabled } from "../utils/envUtils";
import { fetchImageBuffer } from "./fetchImageBuffer";
import { GenerateImageOptions, PLACEHOLDER_IMAGE_URL } from "./generateImage";
import { getImageFromDalle } from "./getImageFromDalle";
import { removeBackground } from "./removeBackground";
import { saveImageBufferToFile } from "./saveImageBufferToFile";
import { saveToS3 } from "./saveToS3";

export async function generateImageDalle(
  prompt: string,
  options: GenerateImageOptions
): Promise<string> {
  const {
    shouldRemoveBackground = true,
    s3Folder = "/",
    brighten = 1.1,
    dalle,
  } = options;
  if (isDrawingEnabled()) {
    const remoteImageUrl = await getImageFromDalle(prompt, dalle?.size);
    const imageName =
      s3Folder + "/" + last(new URL(remoteImageUrl).pathname.split("/"));
    const rawBuffer = await fetchImageBuffer(remoteImageUrl);
    const processedBuffer = shouldRemoveBackground
      ? await removeBackground(rawBuffer)
      : sharp(rawBuffer).modulate({ brightness: brighten });

    if (process.env.DRAWING_SAVE_TARGET === "s3") {
      const buffer = await processedBuffer
        .png({ force: true, compressionLevel: 9 })
        .toBuffer();
      return await saveToS3(buffer, imageName);
    } else {
      return await saveImageBufferToFile(processedBuffer, imageName);
    }
  } else {
    return PLACEHOLDER_IMAGE_URL;
  }
}
