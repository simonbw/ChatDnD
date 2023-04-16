import React, { Fragment } from "react";
import { classNames } from "./classNames";

export function NameTag({
  name,
  size = "sm",
}: {
  name?: string;
  size?: "sm" | "md" | "lg";
}) {
  const words = name?.split(/\s/) ?? [];

  return (
    <span className="space-x-1">
      {words.map((word) => {
        const parts = word.split(/(?=[A-Z])/) ?? [];

        return (
          <span
            className={classNames("text-sepia-500 whitespace-pre-wrap")}
            // style={{ wordSpacing: "4px" }}
          >
            {parts.map((part) => {
              const firstLetter = part[0];
              const rest = part.substring(1);
              return (
                <Fragment>
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
            })}
          </span>
        );
      })}
    </span>
  );
}
