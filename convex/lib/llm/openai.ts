import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { getOpenAiKey, getOpenAiModel } from "../env";
import { apiSafeName, type LlmMessage, type LlmOptions } from "./types";

let client: OpenAI | undefined;
export function openAi(): OpenAI {
  client ??= new OpenAI({
    apiKey: getOpenAiKey(),
    // Optional override, e.g. for a local mock while testing.
    baseURL: process.env.OPENAI_BASE_URL || undefined,
  });
  return client;
}

function toOpenAiMessage(message: LlmMessage): ChatCompletionMessageParam {
  const name = apiSafeName(message.name);
  switch (message.role) {
    case "system":
      return { role: "system", name, content: message.content };
    case "user":
      return { role: "user", name, content: message.content };
    case "assistant":
      return { role: "assistant", name, content: message.content };
  }
}

export async function openAiText(
  messages: LlmMessage[],
  options: LlmOptions
): Promise<string> {
  const response = await openAi().chat.completions.create({
    model: getOpenAiModel(),
    temperature: options.temperature,
    messages: messages.map(toOpenAiMessage),
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI did not return any content");
  }
  return content;
}

export async function* openAiStream(
  messages: LlmMessage[],
  options: LlmOptions
): AsyncGenerator<string> {
  const stream = await openAi().chat.completions.create({
    model: getOpenAiModel(),
    temperature: options.temperature,
    messages: messages.map(toOpenAiMessage),
    stream: true,
  });
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) {
      yield delta;
    }
  }
}
