import React, { useState } from "react";
import { RoomMessage, RoomMessageImage } from "../../common/models/roomModel";
import { WrittenText } from "./WrittenText";
import { classNames } from "./classNames";
import { DissolveInImage } from "./DissolveTransition";

export function Message({ message }: { message: RoomMessage }) {
  const [isFast, setFast] = useState(false);

  const contentItems = parseContent(message.content);

  const isDm = message.role === "assistant";
  return (
    <div
      className={classNames("p-2 flex gap-2", isDm ? "" : "")}
      onClick={() => setFast(true)}
    >
      <div className="w-28 flex-shrink-0 text-right">
        <span className="text-sepia-500 text-sm small-caps w-40 underline underline-offset-8 animate-fade-in">
          {message.name}
        </span>
      </div>
      <div className="flex-grow">
        {contentItems.map((item, i) => {
          switch (item.type) {
            case "text":
              // TODO: don't start each WrittenText until the previous has finished
              return <TextContent key={i} text={item.text} isFast={isFast} />;

            case "image": {
              const image = message.images?.[item.index];
              return <ImageContent key={i} image={image} />;
            }
          }
        })}
      </div>
      <div className="w-28 flex-shrink-0">
        <span className="text-sepia-500 text-sm small-caps w-40 underline underline-offset-8 animate-fade-in"></span>
      </div>
    </div>
  );
}

function ImageContent({ image }: { image?: RoomMessageImage }) {
  return (
    <div>
      <figure
        title={image?.description}
        className="flex flex-col items-center justify-center text-center"
      >
        <div className="w-80 h-w-80 sepia">
          <DissolveInImage
            src={image?.url}
            width={512}
            height={512}
            className="w-full h-full"
          />
        </div>
        {image?.description && (
          <figcaption className="mt-1 text-xs font-italic text-sepia-500 text-center max-w-80">
            <WrittenText interval={0} initialText={image.description}>
              {image.description}
            </WrittenText>
          </figcaption>
        )}
      </figure>
    </div>
  );
}

function TextContent({ isFast, text }: { isFast: boolean; text: string }) {
  return (
    <div className="text-sepia-800 whitespace-pre-wrap text-justify hyphens-auto">
      <WrittenText interval={isFast ? 0 : 20} initialText={text}>
        {text}
      </WrittenText>
    </div>
  );
}

type ContentItem =
  | { type: "text"; text: string }
  | { type: "image"; index: number };

function parseContent(messageContent: string): ContentItem[] {
  const result: ContentItem[] = [];

  let imageIndex = 0;
  let inImage = false;
  let text = "";

  for (const char of messageContent) {
    if (inImage) {
      // end image
      if (char == "}") {
        inImage = false;
        result.push({ type: "image", index: imageIndex });
        imageIndex++;
      }
    } else {
      // start image and end content
      if (char == "{") {
        inImage = true;
        if (text != "") {
          result.push({ type: "text", text });
        }
        text = "";
      } else {
        text += char;
      }
    }
  }

  if (inImage) {
    result.push({ type: "image", index: imageIndex });
  }
  if (text != "") {
    result.push({ type: "text", text });
  }

  return result;
}
