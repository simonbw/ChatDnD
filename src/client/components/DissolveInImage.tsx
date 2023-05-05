import React from "react";
import { useLoadImage } from "../hooks/useLoadImage";
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
  const image = useLoadImage(src, () => {});

  return (
    <img
      key={src}
      src={src}
      className={classNames(
        className,
        "dissolve-in mix-blend-multiply",
        image?.complete ? "" : "opacity-0"
      )}
      style={{ transitionDuration: `${duration}ms` }}
      {...rest}
    />
  );
}
