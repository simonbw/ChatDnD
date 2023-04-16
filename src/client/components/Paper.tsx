import React, { HTMLProps, PropsWithChildren } from "react";
import { classNames } from "./classNames";

export function Paper({
  children,
  className,
  style = {},
  ...rest
}: PropsWithChildren<HTMLProps<HTMLDivElement>>) {
  return (
    <div
      className={classNames(
        "container max-w-2xl mx-auto overflow-hidden mt-4 py-8 xl:py-12",
        "shadow-black shadow-2xl bg-sepia-200 drop-shadow-xl",
        className
      )}
      style={{
        backgroundImage: "url(/static/images/parchment-3.jpg)",
        backgroundSize: "auto",
        backgroundRepeat: "repeat",
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
