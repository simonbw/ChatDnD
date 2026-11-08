/** A chat message in provider-neutral form. Each provider adapts it to its own API. */
export interface LlmMessage {
  role: "system" | "user" | "assistant";
  /** Who is speaking (a character name), if known. */
  name?: string;
  content: string;
}

export interface LlmOptions {
  /**
   * Sampling temperature. Honored by OpenAI; ignored by current Claude models,
   * which don't accept sampling parameters.
   */
  temperature?: number;
}

/** The model declined to answer (e.g. a safety classifier). Any partial output should be discarded. */
export class LlmRefusalError extends Error {}

export function apiSafeName(name?: string): string | undefined {
  return name?.replace(/[^a-zA-Z0-9_-]/g, "_");
}
