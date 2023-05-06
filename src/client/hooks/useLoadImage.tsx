import { useEffect, useRef, useState } from "react";

export function useImageLoaded(
  src: string | undefined,
  onLoad?: () => void
): boolean {
  const [loaded, setLoaded] = useState(false);

  const imageRef = useRef<HTMLImageElement>();
  const callbackRef = useRef(onLoad);
  callbackRef.current = onLoad;

  useEffect(() => {
    const image = new Image();
    imageRef.current = image;
    setLoaded(false);

    const wrappedOnLoad = () => {
      setLoaded(true);
      callbackRef.current?.();
    };
    image.addEventListener("load", wrappedOnLoad);

    if (src) {
      image.src = src;
    }

    return () => image.removeEventListener("load", wrappedOnLoad);
  }, [src]);

  return loaded;
}
