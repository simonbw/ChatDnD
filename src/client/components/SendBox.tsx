import React, { useState } from "react";
import { Button } from "./Button";
import { relativeUrl } from "../utils/relativeUrl";
import { classNames } from "./classNames";
import Textarea from "react-expanding-textarea";
import { usePlayerContext } from "../contexts/playerContext";
import { NameTag } from "./NameTag";

export function SendBox() {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const { player } = usePlayerContext();
  const [secret, setSecret] = useState(false);

  const submit = async () => {
    if (content != "" && player) {
      setSending(true);
      try {
        await fetch(relativeUrl("message"), {
          body: JSON.stringify({ name: player?.name, content, secret }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });
      } catch (error) {
        console.warn("Failed to send message.");
      } finally {
        setSending(false);
      }
      setContent("");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 font-serif border-4 border-sepia-500/0 border-double rounded-sm">
      <NameTag>{player?.name ?? "[unknown]"}</NameTag>
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
