import path from "path";
import { Sharp } from "sharp";
import { getDrawnImageFolder } from "../utils/envUtils";

export async function saveImageBufferToFile(
  buffer: Sharp,
  imageName: string
): Promise<string> {
  const imagePath = path.join(getDrawnImageFolder(), imageName);
  console.log(`[generateImage] saving to ${imagePath}`);
  await buffer.toFile(imagePath);
  return `/static/images/drawn/${imageName}`;
}
