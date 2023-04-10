import React, { useState } from "react";
import { Button } from "./Button";
import { relativeUrl } from "../utils/relativeUrl";

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
    <div className="flex bg-gray-100">
      <input
        type="text"
        className="px-2 py-1"
        onChange={(e) => setName(e.target.value)}
        value={name}
      />
      <input
        type="text"
        className="flex-grow px-2 py-1"
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
      <Button
        kind={secret ? "flat" : "outline"}
        color={"danger"}
        onClick={() => setSecret((s) => !s)}
      >
        {secret ? "🤫" : "😮"}
      </Button>
    </div>
  );
};
