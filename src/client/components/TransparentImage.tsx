import { useEffect, useState } from "react";
import React from "react";
import { classNames } from "../utils/classNames";

export const BLANK_IMAGE =
  "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";

export function TransparentImage({
  src,
  className,
  ...rest
}: React.HTMLProps<HTMLImageElement>) {
  const [convertedSrc, setConvertedSrc] = useState<string>(BLANK_IMAGE);

  useEffect(() => {
    if (src) {
      convertImageToTransparent(src)
        .then((convertedSrc) => setConvertedSrc(convertedSrc))
        .catch((error) => console.error("Failed to convert image", error));
    }

    return () => setConvertedSrc(BLANK_IMAGE);
  }, [src]);

  return (
    <img
      className={classNames("animate-fade-in", className)}
      src={convertedSrc}
      key={convertedSrc}
      {...rest}
    />
  );
}

async function convertImageToTransparent(src: string) {
  const image = new Image();
  image.crossOrigin = "Anonymous";
  image.src = src;

  console.log("converting image");

  return new Promise<string>((resolve, reject) => {
    image.addEventListener("load", () => {
      console.log("image loaded");

      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.warn("failed to get canvas context");
        return reject(new Error("failed to get canvas context"));
      }
      ctx.drawImage(image, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      imageData.colorSpace;
      const [tr, tg, tb] = [data[0], data[1], data[2]];

      for (let i = 0; i < data.length; i += 4) {
        data[i + 3] = convertPixel(data[i], data[i + 1], data[i + 2]);
      }

      ctx.putImageData(imageData, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      console.log("image converted");

      const outImage = new Image();
      outImage.src = dataUrl;

      outImage.onload = () => resolve(dataUrl);

      // return resolve(dataUrl);
    });
  });
}

function convertPixel(r: number, g: number, b: number): number {
  return 255 - Math.min(r, g, b);
}
