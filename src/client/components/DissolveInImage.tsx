import React from "react";
import { useImageLoaded } from "../hooks/useLoadImage";
import { classNames } from "../utils/classNames";

export function DissolveInImage({
  src,
  className,
  width,
  height,
  duration = 1500,
  fadeEdges = true,
  ref: _ref,
  ...rest
}: React.HTMLProps<HTMLImageElement> & {
  duration?: number;
  fadeEdges?: boolean;
}) {
  const loaded = useImageLoaded(src);

  return (
    <img
      key={src}
      src={src}
      className={classNames(
        "fade-edges mix-blend-multiply",
        !loaded && "opacity-0",
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
      {...rest}
    />
  );
}
