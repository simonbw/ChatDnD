import React, { Fragment } from "react";
import { classNames } from "../utils/classNames";

export function NameTag({
  children,
  size = "sm",
  className,
}: {
  children?: string | string[];
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const s = (Array.isArray(children) ? children.join("") : children) ?? "";
  const words = s.split(/\s/) ?? [];

  return (
    <span className={classNames(className, "text-sepia-500")}>
      {words.map((word, i) => {
        const parts = word.split(/(?=[A-Z])/) ?? [];

        return (
          <Fragment key={i}>
            {parts.map((part, j) => {
              const firstLetter = part[0];
              const rest = part.substring(1);
              return (
                <Fragment key={j}>
                  {firstLetter && (
                    <span
                      className={classNames(
                        "relative top-[1px]",
                        "font-drop-cap",
                        size == "sm" && "text-2xl",
                        size == "md" && "text-3xl",
                        size == "lg" && "text-4xl",
                        "align-middle",
                        "tracking-wide"
                      )}
                    >
                      {firstLetter}
                    </span>
                  )}
                  {rest && (
                    <span
                      className={classNames(
                        "underline underline-offset-1",
                        "font-nametag",
                        size == "sm" && "text-md",
                        size == "md" && "text-lg",
                        size == "lg" && "text-xl"
                      )}
                    >
                      {rest}
                    </span>
                  )}
                </Fragment>
              );
            })}{" "}
          </Fragment>
        );
      })}
    </span>
  );
}
