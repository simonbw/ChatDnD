import { Transition } from "@headlessui/react";
import React from "react";
import { Character } from "../../common/models/characterModel";
import { classNames } from "../utils/classNames";
import { Button } from "./Button";
import { DissolveInImage } from "./DissolveInImage";
import { LoadingIndicator } from "./LoadingIndicator";

export function PortraitPicker({
  portrait,
  generating,
  generate,
}: {
  portrait: Character["portrait"];
  generating: boolean;
  generate: (newPrompt: boolean) => void;
}) {
  return (
    <figure className="flex flex-col items-center text-center max-w-64 rounded-md overflow-hidden">
      <span className="whitespace-pre-wrap text-xs">{portrait?.url}</span>
      <div className="w-full flex justify-center items-center relative">
        <img
          src="/static/images/missing-portrait.png"
          className={classNames(
            "w-full h-full aspect-square mix-blend-multiply transition-opacity duration-1000",
            generating ? "opacity-50" : "opacity-0"
          )}
        />
        {portrait?.url && (
          <DissolveInImage
            src={portrait.url}
            className={classNames(
              "w-full h-full aspect-square absolute",
              generating && "opacity-0"
            )}
            width={512}
            height={512}
            duration={1000}
          />
        )}

        <Transition
          as={React.Fragment}
          show={generating}
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className={classNames(
              "pointer-events-none",
              "absolute w-full h-full",
              "flex justify-center items-center"
            )}
          >
            <LoadingIndicator size={192} />
          </div>
        </Transition>

        {!generating && (
          <div
            className={classNames(
              "absolute w-full h-full aspect-square",
              "flex justify-center items-center p-2",
              "transition-opacity bg-sepia/90",
              "overflow-auto",
              generating ? "opacity-0" : "opacity-0 hover:opacity-90"
            )}
          >
            {portrait?.caption ? (
              <div className="flex flex-col gap-2 items-center">
                <Button
                  kind="flat"
                  color="white"
                  onClick={(event) => {
                    event.preventDefault();
                    generate(false);
                  }}
                >
                  Keep Prompt
                </Button>
                <Button
                  kind="flat"
                  color="white"
                  onClick={(event) => {
                    event.preventDefault();
                    generate(true);
                  }}
                >
                  New Prompt
                </Button>
                {portrait?.caption && (
                  <figcaption className="text-xs my-1 italic text-sepia-50 text-center max-w-80 mx-auto font-caption">
                    {portrait.caption}
                  </figcaption>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2 items-center">
                <Button
                  kind="flat"
                  color="white"
                  onClick={(event) => {
                    event.preventDefault();
                    generate(true);
                  }}
                >
                  Draw Portrait
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </figure>
  );
}
