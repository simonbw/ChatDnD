import React from "react";
import { useRoomState } from "../hooks/useRoomState";
import { classNames } from "./classNames";
import { LoadingDots } from "./LoadingDots";

export const MessagePane: React.FC = () => {
  const state = useRoomState();

  return (
    <div>
      {!state && (
        <div className="flex items-center p-2">
          <LoadingDots />
        </div>
      )}
      {state?.messages.length == 0 && (
        <div className="italic p-2 text-gray-700 text-center">
          No messages yet
        </div>
      )}
      {state?.messages.map((message, i) => (
        <div
          key={i}
          className={classNames(
            "p-2",
            message.role == "assistant" ? "bg-gray-300" : "bg-gray-400"
          )}
        >
          <span className="text-gray-700 bold tracking-tight text-sm small-caps">
            {message.name}
            {message.secret && <span> (whispered)</span>}:{" "}
          </span>
          <span className="text-gray-900">{message.content}</span>
        </div>
      ))}
    </div>
  );
};
