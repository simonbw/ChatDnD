import React from "react";
import { classNames } from "./classNames";

export function NameTag({ name }: { name?: string }) {
  return (
    <span
      className={classNames(
        "text-sepia-500 block",
        "underline underline-offset-2",
        "small-caps",
        "animate-fade-in",
        "font-nametag",
        // "tracking-wide",
        "text-sm",
        "first-letter:font-black_chancery first-letter:text-xl first-letter:inline-block first-letter:align-middle"
      )}
    >
      {name}
    </span>
  );
}
