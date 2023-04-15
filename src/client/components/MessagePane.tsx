import React from "react";
import { useRoomState } from "../hooks/useRoomState";
import { Message } from "./Message";
import { SendBox } from "./SendBox";

export function MessagePane() {
  const state = useRoomState();

  return (
    <div className="flex flex-col font-serif gap-8">
      <div className="flex-grow flex flex-col gap-8">
        {state?.messages.length == 0 && (
          <div className="italic p-2 text-sepia-700 text-center">
            No messages yet
          </div>
        )}
        {state?.messages.map((message, i) => (
          <Message message={message} key={i} />
        ))}
      </div>
      <SendBox />
    </div>
  );
}
