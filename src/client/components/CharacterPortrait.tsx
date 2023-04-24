import React from "react";
import { Character } from "../../common/models/characterModel";
import { DissolveInImage } from "./DissolveInImage";
import { classNames } from "../utils/classNames";

export function CharacterPortrait({
  portrait,
  imageClassName,
  className,
  ...rest
}: React.HTMLProps<HTMLElement> & {
  imageClassName?: string;
  portrait: Character["portrait"];
}) {
  return (
    <figure
      {...rest}
      className={classNames(
        className,
        "flex flex-col items-center justify-center text-center"
      )}
    >
      <div className={classNames("sepia-[40%]")}>
        {portrait?.url && (
          <DissolveInImage
            src={portrait.url}
            width={512}
            height={512}
            className="w-full h-full"
            duration={1000}
          />
        )}
      </div>
      {/* {portrait?.caption && (
        <figcaption className="text-xs my-1 italic text-sepia text-center max-w-80 mx-auto font-caption">
          {portrait.caption}
        </figcaption>
      )} */}
    </figure>
  );
}
