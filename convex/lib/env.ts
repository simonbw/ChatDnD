/*
 * Environment configuration. Set these on the Convex deployment
 * (`npx convex env set NAME value`, or the Convex dashboard).
 */

const DEFAULT_GPT_MODEL = "gpt-4.1-mini";

export function getOpenAiKey(): string {
  return assertConfigured("OPENAI_API_KEY");
}

export function getStabilityKey(): string {
  return assertConfigured("STABILITY_KEY");
}

export function getDefaultGPTModel(): string {
  return process.env.GPT_MODEL || DEFAULT_GPT_MODEL;
}

export function getStorytellingGPTModel(): string {
  return process.env.STORYTELLING_GPT_MODEL || getDefaultGPTModel();
}

export function getSummarizingGPTModel(): string {
  return process.env.SUMMARIZING_GPT_MODEL || getDefaultGPTModel();
}

export function getGenerationGPTModel(): string {
  return process.env.GENERATION_GPT_MODEL || getDefaultGPTModel();
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
