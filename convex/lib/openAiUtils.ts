import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { getDefaultGPTModel, getOpenAiKey } from "./env";

export type ChatMessage = ChatCompletionMessageParam;

interface ChatConfig {
  model?: string;
  temperature?: number;
}

let client: OpenAI | undefined;
export function openAi(): OpenAI {
  client ??= new OpenAI({
    apiKey: getOpenAiKey(),
    // Optional override, e.g. for a local mock while testing.
    baseURL: process.env.OPENAI_BASE_URL || undefined,
  });
  return client;
}

export function apiSafeName(name?: string): string | undefined {
  return name?.replace(/[^a-zA-Z0-9_-]/g, "_");
}

export async function simpleTextResponse(
  messages: ChatMessage[],
  config: ChatConfig = {}
): Promise<string> {
  const response = await openAi().chat.completions.create({
    model: config.model ?? getDefaultGPTModel(),
    temperature: config.temperature,
    messages,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Chat API did not return any content");
  }
  return content;
}

/** Streams a chat completion, yielding text deltas as they arrive. */
export async function* streamTextResponse(
  messages: ChatMessage[],
  config: ChatConfig = {}
): AsyncGenerator<string> {
  const stream = await openAi().chat.completions.create({
    model: config.model ?? getDefaultGPTModel(),
    temperature: config.temperature,
    messages,
    stream: true,
  });
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) {
      yield delta;
    }
  }
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
