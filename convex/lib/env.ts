/*
 * Environment configuration. Set these on the Convex deployment
 * (`npx convex env set NAME value`, or the Convex dashboard). Changes take
 * effect on the next request, without a redeploy.
 *
 *   TEXT_PROVIDER      "openai" (default) or "anthropic"
 *   OPENAI_API_KEY     required when either provider setting uses OpenAI
 *   OPENAI_MODEL       text model, default gpt-4.1-mini
 *   ANTHROPIC_API_KEY  required when TEXT_PROVIDER=anthropic
 *   ANTHROPIC_MODEL    default claude-opus-5-5
 *   ANTHROPIC_EFFORT   optional: low | medium | high | xhigh | max
 *
 *   IMAGE_PROVIDER     "stability" (default) or "openai"
 *   STABILITY_KEY      required when IMAGE_PROVIDER=stability
 *   OPENAI_IMAGE_MODEL default gpt-image-2
 *   OPENAI_IMAGE_QUALITY  low | medium (default) | high
 *   DRAWING_ENABLED    "true" to draw images at all
 */

export type TextProvider = "openai" | "anthropic";
export type ImageProvider = "stability" | "openai";
export type AnthropicEffort = "low" | "medium" | "high" | "xhigh" | "max";
export type OpenAiImageQuality = "low" | "medium" | "high";

export function getTextProvider(): TextProvider {
  return oneOf("TEXT_PROVIDER", ["openai", "anthropic"], "openai");
}

export function getImageProvider(): ImageProvider {
  return oneOf("IMAGE_PROVIDER", ["stability", "openai"], "stability");
}

export function getOpenAiKey(): string {
  return assertConfigured("OPENAI_API_KEY");
}

export function getOpenAiModel(): string {
  return process.env.OPENAI_MODEL || "gpt-4.1-mini";
}

export function getOpenAiImageModel(): string {
  return process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";
}

export function getOpenAiImageQuality(): OpenAiImageQuality {
  return oneOf("OPENAI_IMAGE_QUALITY", ["low", "medium", "high"], "medium");
}

export function getAnthropicKey(): string {
  return assertConfigured("ANTHROPIC_API_KEY");
}

export function getAnthropicModel(): string {
  return process.env.ANTHROPIC_MODEL || "claude-opus-5-5";
}

export function getAnthropicEffort(): AnthropicEffort | undefined {
  const value = process.env.ANTHROPIC_EFFORT;
  if (!value) {
    return undefined;
  }
  return oneOf<AnthropicEffort>(
    "ANTHROPIC_EFFORT",
    ["low", "medium", "high", "xhigh", "max"],
    "medium"
  );
}

export function getStabilityKey(): string {
  return assertConfigured("STABILITY_KEY");
}

export function isDrawingEnabled(): boolean {
  return process.env.DRAWING_ENABLED == "true";
}

function assertConfigured(varName: string): string {
  const value = process.env[varName];
  if (!value) {
    throw new Error(`${varName} is not configured`);
  }
  return value;
}

function oneOf<T extends string>(
  varName: string,
  options: readonly T[],
  fallback: T
): T {
  const value = process.env[varName];
  if (!value) {
    return fallback;
  }
  if ((options as readonly string[]).includes(value)) {
    return value as T;
  }
  console.warn(
    `[env] Ignoring invalid ${varName}="${value}"; using "${fallback}"`
  );
  return fallback;
}
