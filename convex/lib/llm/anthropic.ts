import Anthropic from "@anthropic-ai/sdk";
import { getAnthropicEffort, getAnthropicKey, getAnthropicModel } from "../env";
import { LlmRefusalError, type LlmMessage } from "./types";

let client: Anthropic | undefined;
function anthropic(): Anthropic {
  client ??= new Anthropic({
    apiKey: getAnthropicKey(),
    // Optional override, e.g. for a local mock while testing.
    baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
  });
  return client;
}

/**
 * Builds the request body shared by streaming and non-streaming calls.
 *
 * The app's prompts are OpenAI-shaped: system messages can appear anywhere
 * and speakers are identified by `name`. Here, leading system messages become
 * the top-level `system` prompt, later ones (game events like a player
 * joining) become user turns, and speaker names are written into the text.
 */
function buildRequest(messages: LlmMessage[]) {
  const model = getAnthropicModel();
  const effort = getAnthropicEffort();

  let firstTurn = messages.findIndex((m) => m.role !== "system");
  if (firstTurn === -1) {
    // Only system messages (e.g. the system prompt plus a "player joined"
    // event): the last one becomes the user turn, the rest the system prompt.
    firstTurn = messages.length - 1;
  }
  const system = messages
    .slice(0, firstTurn)
    .map((m) => m.content)
    .join("\n\n");

  const turns: Anthropic.Beta.BetaMessageParam[] = messages
    .slice(firstTurn)
    .map((m) => {
      switch (m.role) {
        case "system":
          return { role: "user", content: `[Game event] ${m.content}` };
        case "user":
          return {
            role: "user",
            content: m.name ? `${m.name}: ${m.content}` : m.content,
          };
        case "assistant":
          return { role: "assistant", content: m.content };
      }
    });

  if (turns.length === 1 && firstTurn === 0 && messages[0].role === "system") {
    // A lone instruction (e.g. the summarizer) is sent as a plain user turn.
    turns[0] = { role: "user", content: messages[0].content };
  }
  if (turns.length === 0 || turns[0].role !== "user") {
    turns.unshift({ role: "user", content: "(The story continues.)" });
  }
  if (turns[turns.length - 1].role !== "user") {
    // Current Claude models don't accept a trailing assistant turn (prefill).
    turns.push({ role: "user", content: "(Continue.)" });
  }

  // Haiku has no server-side fallback; on the others, retry a safety
  // decline on the model Anthropic recommends instead of failing.
  const supportsFallback = !model.includes("haiku");

  return {
    model,
    system: system || undefined,
    messages: turns,
    ...(effort ? { output_config: { effort } } : {}),
    ...(supportsFallback
      ? {
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default" as const,
        }
      : {}),
  };
}

export async function anthropicText(messages: LlmMessage[]): Promise<string> {
  const response = await anthropic().beta.messages.create({
    ...buildRequest(messages),
    max_tokens: 16000,
  });
  if (response.stop_reason === "refusal") {
    throw new LlmRefusalError(
      `Claude declined: ${response.stop_details?.category ?? "unknown"}`
    );
  }
  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
  if (!text) {
    throw new Error("Claude did not return any text");
  }
  return text;
}

export async function* anthropicStream(
  messages: LlmMessage[]
): AsyncGenerator<string> {
  const stream = anthropic().beta.messages.stream({
    ...buildRequest(messages),
    max_tokens: 64000,
  });
  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
  const final = await stream.finalMessage();
  if (final.stop_reason === "refusal") {
    throw new LlmRefusalError(
      `Claude declined: ${final.stop_details?.category ?? "unknown"}`
    );
  }
}
