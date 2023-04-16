import { useEffect, useRef } from "react";

export function useLoadImage(
  src: string | undefined,
  onLoad: () => void
): HTMLImageElement | undefined {
  const imageRef = useRef<HTMLImageElement>();
  const callbackRef = useRef(onLoad);
  callbackRef.current = onLoad;

  useEffect(() => {
    const image = new Image();
    imageRef.current = image;

    const wrappedOnLoad = () => {
      callbackRef.current?.();
    };
    image.addEventListener("load", wrappedOnLoad);

    if (src) {
      image.src = src;
    }

    return () => image.removeEventListener("load", wrappedOnLoad);
  }, [src]);

  return imageRef.current;
}
