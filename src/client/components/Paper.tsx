import React, { HTMLProps, PropsWithChildren, forwardRef } from "react";
import { classNames } from "../utils/classNames";

type Props = PropsWithChildren<HTMLProps<HTMLDivElement>> & {
  small?: boolean;
};

export const Paper = forwardRef<HTMLDivElement, Props>(
  ({ children, className, small, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={classNames(small ? "paper-small" : "paper", className)}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

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
