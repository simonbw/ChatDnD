import {
  ChatCompletionRequestMessage,
  CreateChatCompletionRequest,
  OpenAIApi,
  Configuration as OpenAiConfiguration,
} from "openai";
import { last } from "../../common/utils/arrayUtils";
import { StreamMessageDelta, streamMessageSchema } from "../RoomMessageBuilder";
import { WebError } from "../WebError";
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

export async function simpleTextResponse(
  messages: ChatCompletionRequestMessage[],
  options: Partial<CreateChatCompletionRequest> = {}
) {
  const chatResponse = await openAi().createChatCompletion({
    ...options,
    model: "gpt-3.5-turbo",
    messages,
  });

  const content = chatResponse.data.choices[0].message?.content;
  if (!content) {
    throw new WebError("Chat API did not return any content", 500);
  }
  return content;
}

export function cleanupChatResponse(
  content: string,
  options: { stripQuotes?: boolean; singlePhrase?: boolean } = {}
): string {
  const { stripQuotes = true, singlePhrase = false } = options;
  let result = content;

  if (stripQuotes) {
    result = result.replace(/"/g, "");
  }

  if (singlePhrase && last(result) == ".") {
    result = result.substring(0, result.length - 1);
  }

  return result;
}
