import sharp, { Sharp } from "sharp";

export async function removeBackground(buffer: ArrayBuffer): Promise<Sharp> {
  const mainImage = sharp(buffer);
  const lightness = mainImage.clone().bandbool("or").linear(1).negate();

  return mainImage
    .removeAlpha()
    .toColorspace("rgb")
    .joinChannel(await lightness.toBuffer(), {});
}
