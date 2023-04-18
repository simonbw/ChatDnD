import React, { useState } from "react";
import { RoomMessage, RoomMessageImage } from "../../common/models/roomModel";
import { WrittenText } from "./WrittenText";
import { classNames } from "./classNames";
import { DissolveInImage } from "./DissolveTransition";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { NameTag } from "./NameTag";

export function Message({ message }: { message: RoomMessage }) {
  const [isFast, setFast] = useState(false);

  const contentItems = parseContent(message.content);

  const isChatDnD = message.role === "assistant";
  return (
    <div
      className={classNames(
        "py-4 flex gap-2",
        "flex-col",
        "sm:flex-row sm:p-r-16"
        // isChatDnD ? "bg-sepia-600/10" : ""
      )}
      onClick={() => setFast(true)}
    >
      <div
        className={classNames(
          "border-sepia/50",
          "sm:w-28 sm:flex-shrink-0 sm:text-right sm:pr-2",
          "sm:border-r "
        )}
      >
        <NameTag size="sm">{message.name}</NameTag>
      </div>
      <div className="flex-grow">
        {contentItems.map((item, i) => {
          switch (item.type) {
            case "text":
              // TODO: don't start each WrittenText until the previous has finished
              return <MessageText key={i} text={item.text} isFast={isFast} />;

            case "image": {
              const image = message.images?.[item.index];
              return <MessageImage key={i} image={image} />;
            }
          }
        })}
      </div>
    </div>
  );
}

function MessageText({ isFast, text }: { isFast: boolean; text: string }) {
  return (
    <div
      className={classNames(
        "text-sepia-800",
        "whitespace-pre-wrap",
        "text-justify hyphens-auto",
        "font-body text-md tracking-normal",
        "leading-snug"
      )}
      style={{}}
    >
      {/* <WrittenText interval={isFast ? 0 : 20} initialText={text}> */}
      <ReactMarkdown className="message">{text}</ReactMarkdown>
      {/* </WrittenText> */}
    </div>
  );
}

function MessageImage({ image }: { image?: RoomMessageImage }) {
  return (
    <div>
      <figure
        title={image?.description}
        className="flex flex-col items-center justify-center text-center"
      >
        <div className="w-80 h-w-80 sepia-[40%]">
          <DissolveInImage
            src={image?.url}
            width={512}
            height={512}
            className="w-full h-full"
          />
        </div>
        {image?.description && (
          <figcaption className="my-1 text-sm italic text-sepia-500 text-center max-w-80 font-caption">
            <WrittenText interval={0} initialText={image.description}>
              {image.description}
            </WrittenText>
          </figcaption>
        )}
      </figure>
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
