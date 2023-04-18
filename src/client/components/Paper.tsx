import React, { HTMLProps, PropsWithChildren } from "react";
import { classNames } from "./classNames";

export function Paper({
  children,
  className,
  ...rest
}: PropsWithChildren<HTMLProps<HTMLDivElement>>) {
  return (
    <div className={classNames("paper p-8 xl:p-12", className)} {...rest}>
      {children}
    </div>
  );
}
