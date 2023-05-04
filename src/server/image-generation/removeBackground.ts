import sharp, { Sharp } from "sharp";

export async function removeBackground(buffer: ArrayBuffer): Promise<Sharp> {
  const mainImage = sharp(buffer);

  const alpha = mainImage.clone().bandbool("or").linear(1).negate();

  return mainImage
    .removeAlpha()
    .toColorspace("rgb")
    .joinChannel(await alpha.toBuffer(), {});
}
