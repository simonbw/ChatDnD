import React, { HTMLProps } from "react";
import { classNames } from "../../utils/classNames";

export function CaretLeft({
  style,
  className,
  ...rest
}: HTMLProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 256 256"
      style={{
        fillRule: "evenodd",
        clipRule: "evenodd",
        strokeLinejoin: "round",
        strokeMiterlimit: 2,
        stroke: "currentcolor",
        fill: "currentcolor",
        ...style,
      }}
      className={classNames(className, "inline-block h-4 align-middle")}
      {...rest}
    >
      <g transform="matrix(-7.00901,0,0,-5.75676,339.478,313.219)">
        <path d="M32.015,35.305C31.909,35.431 28.74,38.511 25.898,42.072C23.169,45.493 21.071,48.99 20.075,50.621C19.787,51.092 19.199,51.885 19.199,51.885L22.618,49.482C23.522,48.158 24.54,46.902 27.327,43.566C33.056,36.71 39.973,30.965 39.973,30.965C37.568,30.036 35.166,28.91 33.407,27.851C32.514,27.313 31.708,26.793 30.986,26.17C26.18,22.017 24.419,17.505 21.794,13.309L21.724,12.789L19.781,15.114C20.479,15.077 31.879,33.262 32.015,35.305Z" />
      </g>
    </svg>
  );
}

export function CaretRight({
  style,
  className,
  ...rest
}: HTMLProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 256 256"
      style={{
        fillRule: "evenodd",
        clipRule: "evenodd",
        strokeLinejoin: "round",
        strokeMiterlimit: 2,
        stroke: "currentcolor",
        fill: "currentcolor",
        ...style,
      }}
      className={classNames(className, "inline-block h-4 align-middle")}
      {...rest}
    >
      <g transform="matrix(7.00901,0,0,5.75676,-75.2613,-59.0946)">
        <path d="M32.015,35.305C31.909,35.431 28.74,38.511 25.898,42.072C23.169,45.493 21.071,48.99 20.075,50.621C19.787,51.092 19.199,51.885 19.199,51.885L22.618,49.482C23.522,48.158 24.54,46.902 27.327,43.566C33.056,36.71 39.973,30.965 39.973,30.965C37.568,30.036 35.166,28.91 33.407,27.851C32.514,27.313 31.708,26.793 30.986,26.17C26.18,22.017 24.419,17.505 21.794,13.309L21.724,12.789L19.781,15.114C20.479,15.077 31.879,33.262 32.015,35.305Z" />
      </g>
    </svg>
  );
}
