import { OpenAIApi, Configuration as OpenAiConfiguration } from "openai";
import { StreamMessageDelta, streamMessageSchema } from "../RoomMessageBuilder";
import { getOpenAiKey } from "./envUtils";
import { makeSingleton } from "./makeSingleton";

export const openAi = makeSingleton(
  () =>
    new OpenAIApi(
      new OpenAiConfiguration({
        apiKey: getOpenAiKey(),
      })
    )
);

export function parseDeltaStream(raw: Uint8Array): StreamMessageDelta[] {
  const lines = raw
    .toString()
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

  return lines
    .map((rawLine) => {
      if (rawLine.includes("[DONE]")) {
        return null;
      }

      const line = rawLine.replace(/^data: /, "");

      try {
        const data = streamMessageSchema.parse(JSON.parse(line));
        return data.choices[0].delta;
      } catch (e) {
        console.log("failed to parse:\n", line, "\n\n");
        return null;
      }
    })
    .filter((delta): delta is StreamMessageDelta => delta != null);
}

export function apiSafeName(name?: string): string | undefined {
  return name?.replace(/[^a-zA-Z0-9_-]/g, "_");
}
