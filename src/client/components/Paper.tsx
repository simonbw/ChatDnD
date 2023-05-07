import React, { HTMLProps, PropsWithChildren } from "react";
import { classNames } from "../utils/classNames";

export function Paper({
  children,
  className,
  small,
  ...rest
}: PropsWithChildren<HTMLProps<HTMLDivElement>> & { small?: boolean }) {
  return (
    <div
      className={classNames(small ? "paper-small" : "paper", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function PaperContainer({
  children,
  className,
  ...rest
}: PropsWithChildren<HTMLProps<HTMLDivElement>>) {
  return (
    <div className={classNames("paper-container", className)} {...rest}>
      {children}
    </div>
  );
}
