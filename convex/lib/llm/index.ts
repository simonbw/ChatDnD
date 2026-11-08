import { getTextProvider } from "../env";
import { anthropicStream, anthropicText } from "./anthropic";
import { openAiStream, openAiText } from "./openai";
import type { LlmMessage, LlmOptions } from "./types";

/*
 * Provider-neutral text generation. TEXT_PROVIDER (on the Convex deployment)
 * picks OpenAI or Anthropic; changing it takes effect on the next request.
 */

export { apiSafeName, LlmRefusalError } from "./types";
export type { LlmMessage, LlmOptions } from "./types";

/** Generates a complete response. */
export async function textResponse(
  messages: LlmMessage[],
  options: LlmOptions = {}
): Promise<string> {
  return getTextProvider() === "anthropic"
    ? await anthropicText(messages)
    : await openAiText(messages, options);
}

/** Streams a response, yielding text as it arrives. */
export function streamText(
  messages: LlmMessage[],
  options: LlmOptions = {}
): AsyncGenerator<string> {
  return getTextProvider() === "anthropic"
    ? anthropicStream(messages)
    : openAiStream(messages, options);
}

export function cleanupChatResponse(
  content: string,
  options: { stripQuotes?: boolean; singlePhrase?: boolean } = {}
): string {
  const { stripQuotes = true, singlePhrase = false } = options;
  let result = content.trim();

  if (stripQuotes) {
    result = result.replace(/"/g, "");
  }

  if (singlePhrase && result.endsWith(".")) {
    result = result.substring(0, result.length - 1);
  }

  return result;
}
