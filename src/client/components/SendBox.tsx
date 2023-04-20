import React, { useState } from "react";
import Textarea from "react-expanding-textarea";
import { usePlayer, usePlayerId } from "../contexts/playerIdContext";
import { relativeUrl } from "../utils/relativeUrl";
import { Button } from "./Button";
import { NameTag } from "./NameTag";
import { classNames } from "../utils/classNames";
import { useRoom } from "../hooks/useRoomState";

export function SendBox({ roomId }: { roomId: string }) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [secret, setSecret] = useState(false);
  const player = usePlayer();

  const submit = async () => {
    if (content != "" && player) {
      setSending(true);
      try {
        await fetch(relativeUrl("message"), {
          body: JSON.stringify({ content, secret, playerId: player.id }),
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
    <div
      className={classNames(
        "flex flex-col items-stretch gap-2 font-serif py-4",
        "sm:flex-row sm:items-center",
        "border-t-4 border-sepia/50 border-double"
      )}
    >
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
            if (!sending) {
              submit();
            }
          }
        }}
        value={content}
      />
      <Button kind="flat" color="primary" onClick={submit} loading={sending}>
        Send
      </Button>
    </div>
  );
}
