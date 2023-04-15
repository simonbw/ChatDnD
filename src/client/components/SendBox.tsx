import React, { useState } from "react";
import { Button } from "./Button";
import { relativeUrl } from "../utils/relativeUrl";
import { classNames } from "./classNames";
import Textarea from "react-expanding-textarea";

export const SendBox: React.FC = () => {
  const [content, setContent] = useState("");
  const [name, setName] = useState("Simon");
  const [secret, setSecret] = useState(false);

  const submit = async () => {
    fetch(relativeUrl("message"), {
      body: JSON.stringify({ name, content, secret }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    setContent("");
  };

  return (
    <div className="flex gap-2 p-4 font-serif border-4 border-sepia-300 border-double items-center rounded-sm">
      <input
        type="text"
        className={classNames(
          "flex-shrink px-0 py-1 bg-transparent w-24 text-right",
          "underline underline-offset-4 small-caps text-sepia-500 text-sm rounded",
          "focus:outline-none focus:border-none focus:bg-sepia-500/20 hover:bg-sepia-500/20"
        )}
        onChange={(e) => setName(e.target.value)}
        value={name}
      />
      <Textarea
        className={classNames(
          "flex-grow px-2 py-1 bg-sepia-500/[15%] rounded resize-none transition-colors",
          "focus:outline-none focus:bg-sepia-500/20 hover:bg-sepia-500/20"
        )}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        value={content}
      />
      <Button
        kind="outline"
        color="primary"
        onClick={submit}
        className="uppercase"
      >
        Send
      </Button>
      <Button
        kind={secret ? "flat" : "outline"}
        color={"danger"}
        onClick={() => setSecret((s) => !s)}
        className="uppercase"
      >
        {secret ? "🤫" : "😮"}
      </Button>
    </div>
  );
};
