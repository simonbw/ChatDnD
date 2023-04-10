import React from "react";
import { classNames } from "./classNames";

export function LoadingDots({
  size = "sm",
  color = "bg-white",
  className,
  ...rest
}: {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  color?: string;
} & React.ComponentProps<"span">) {
  const sizeClasses = {
    xs: "w-1 h-1",
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2 h-2",
    xl: "w-2.5 h-2.5",
    "2xl": "w-4 h-4",
    "3xl": "w-6 h-6",
  }[size];
  const gap = {
    xs: "gap-1",
    sm: "gap-1.5",
    md: "gap-1.5",
    lg: "gap-1.5",
    xl: "gap-2",
    "2xl": "gap-2.5",
    "3xl": "gap-2.5",
  }[size];
  return (
    <span className={classNames("inline-flex", gap, className)} {...rest}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={classNames(
            "rounded-full",
            ["animate-dot-1", "animate-dot-2", "animate-dot-3"][i],
            color,
            sizeClasses
          )}
        />
      ))}
    </span>
  );
}
