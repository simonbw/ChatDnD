import { useMutation } from "convex/react";
import React, { useState } from "react";
import Textarea from "react-expanding-textarea";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { usePlayer } from "../contexts/playerIdContext";
import { classNames } from "../utils/classNames";
import { Button } from "./Button";
import { NameTag } from "./NameTag";

export function SendBox({ roomId }: { roomId: string }) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [whispered, setWhisper] = useState(false);
  const player = usePlayer();
  const sendMessage = useMutation(api.messages.send);

  if (!player) {
    return null;
  }

  const submit = async () => {
    if (content != "" && player) {
      setSending(true);
      try {
        await sendMessage({
          roomId: roomId as Id<"rooms">,
          playerId: player.id,
          content,
          whispered,
        });
        setContent("");
      } catch (error) {
        console.warn("Failed to send message.", error);
      } finally {
        setSending(false);
      }
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
      <NameTag>{player.character.name ?? "[unknown]"}</NameTag>
      <Textarea
        className={classNames("text-input flex-grow")}
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
