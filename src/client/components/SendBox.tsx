import React, { useState } from "react";
import { Button } from "./Button";
import { relativeUrl } from "../utils/relativeUrl";
import { classNames } from "./classNames";
import Textarea from "react-expanding-textarea";
import { usePlayerContext } from "../contexts/playerContext";
import { NameTag } from "./NameTag";

export function SendBox() {
  const [content, setContent] = useState("");
  const { player } = usePlayerContext();
  const [secret, setSecret] = useState(false);

  const submit = async () => {
    fetch(relativeUrl("message"), {
      body: JSON.stringify({ name: player?.name, content, secret }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    setContent("");
  };

  return (
    <div className="flex gap-2 p-4 font-serif border-t-4 border-sepia-300 border-double items-center rounded-sm">
      <NameTag name={`${player?.name ?? "[unknown]"}`} />
      <Textarea
        className={classNames(
          "flex-grow px-2 py-1.5 bg-sepia-500/[15%] rounded resize-none transition-colors",
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
      <Button kind="flat" color="primary" onClick={submit}>
        Send
      </Button>
      {/* <Button
        kind={secret ? "flat" : "outline"}
        color={"danger"}
        onClick={() => setSecret((s) => !s)}
      >
        {secret ? "🤫" : "😮"}
      </Button> */}
    </div>
  );
}
