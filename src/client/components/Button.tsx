import React, { ForwardedRef, forwardRef } from "react";
import { classNames } from "./classNames";
import { LoadingDots } from "./LoadingDots";

export const ButtonKinds = ["full", "flat", "outline", "text"] as const;
export const ButtonColors = [
  "primary",
  "secondary",
  "danger",
  "white",
] as const;
export const ButtonSizes = ["xs", "sm", "md", "lg", "xl"] as const;
export type ButtonColor = (typeof ButtonColors)[number];
export type ButtonKind = (typeof ButtonKinds)[number];
export type ButtonSize = (typeof ButtonSizes)[number];

const kindClasses: Record<ButtonKind, string> = {
  full: "button-full",
  flat: "button-flat",
  outline: "button-outline",
  text: "button-text",
};

const disabledKindClasses: Record<ButtonKind, string> = {
  full: "button-full-disabled",
  flat: "button-flat-disabled",
  outline: "button-outline-disabled",
  text: "button-text-disabled",
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: "px-2.5 py-1 text-xs font-medium",
  sm: "px-3 py-1.5 text-xs font-medium",
  md: "px-4 py-1.5 text-sm font-medium",
  lg: "px-6 py-2 text-base font-medium",
  xl: "px-6 py-2 text-lg font-medium",
};

const colorClasses: Record<ButtonColor, string> = {
  primary: "button-primary",
  secondary: "button-secondary",
  danger: "button-danger",
  white: "button-white",
};

const colorKindClasses: Record<ButtonColor, Record<ButtonKind, string>> = {
  primary: {
    full: "button-primary-full",
    flat: "button-primary-flat",
    outline: "button-primary-outline",
    text: "button-primary-text",
  },
  secondary: {
    full: "button-secondary-full",
    flat: "button-secondary-flat",
    outline: "button-secondary-outline",
    text: "button-secondary-text",
  },
  danger: {
    full: "button-danger-full",
    flat: "button-danger-flat",
    outline: "button-danger-outline",
    text: "button-danger-text",
  },
  white: {
    full: "button-white-full",
    flat: "button-white-flat",
    outline: "button-white-outline",
    text: "button-white-text",
  },
};

const loadingColorKindClasses: Record<
  ButtonColor,
  Record<ButtonKind, string>
> = {
  primary: {
    full: "button-primary-full-loading",
    flat: "button-primary-flat-loading",
    outline: "button-primary-outline-loading",
    text: "button-primary-text-loading",
  },
  secondary: {
    full: "button-secondary-full-loading",
    flat: "button-secondary-flat-loading",
    outline: "button-secondary-outline-loading",
    text: "button-secondary-text-loading",
  },
  danger: {
    full: "button-danger-full-loading",
    flat: "button-danger-flat-loading",
    outline: "button-danger-outline-loading",
    text: "button-danger-text-loading",
  },
  white: {
    full: "button-white-full-loading",
    flat: "button-white-flat-loading",
    outline: "button-white-outline-loading",
    text: "button-white-text-loading",
  },
};

export const Button = forwardRef(function ButtonImpl(
  {
    children,
    className,
    disabled,
    block,
    color = "secondary",
    kind = "full",
    loading,
    hideFocus,
    size = "sm",
    ...rest
  }: {
    block?: boolean;
    color?: ButtonColor;
    kind?: ButtonKind;
    loading?: boolean;
    size?: ButtonSize;
    hideFocus?: boolean;
  } & React.ComponentProps<"button">,
  ref: ForwardedRef<HTMLButtonElement>
) {
  return (
    <button
      ref={ref}
      className={classNames(
        "button",
        !hideFocus && "button-focusable",
        sizeClasses[size],
        kindClasses[kind],
        colorClasses[color],
        colorKindClasses[color][kind],
        block ? "flex" : "inline-flex",
        loading && "button-loading",
        loading && loadingColorKindClasses[color][kind],
        disabled && disabledKindClasses[kind],
        className
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {children}
      {loading && (
        <span
          className={classNames(
            "absolute inset-0 flex justify-center items-center"
          )}
        >
          <LoadingDots size={size} />
        </span>
      )}
    </button>
  );
});
