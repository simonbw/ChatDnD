import path from "path";
import { z } from "zod";

export function getNodeEnv(): string {
  return process.env.NODE_ENV ?? "";
}

export function isDev(): boolean {
  return getNodeEnv() === "development";
}

export function getPort(): number {
  return Number(process.env.PORT ?? "3000");
}

export function getOpenAiKey(): string {
  return assertConfigured("OPENAI_API_KEY");
}

export function getStabilityKey(): string {
  return assertConfigured("STABILITY_KEY");
}

export function getElevenLabsKey(): string {
  return process.env.ELEVEN_LABS_KEY ?? "";
}

export function getDefaultGPTModel(): string {
  return process.env.GPT_MODEL ?? "gpt-3.5-turbo";
}

export function getStorytellingGPTModel(): string {
  return process.env.STORYTELLING_GPT_MODEL ?? "gpt-3.5-turbo";
}

export function getSummarizingGPTModel(): string {
  return process.env.SUMMARIZING_GPT_MODEL ?? "gpt-3.5-turbo";
}

export function getGenerationGPTModel(): string {
  return process.env.GENERATION_GPT_MODEL ?? "gpt-3.5-turbo";
}

export function getDrawnImageFolder(): string {
  return path.join(getStaticsFolder(), "images/drawn");
}

export function getStaticsFolder(): string {
  return path.join(__dirname, "../../dist/client");
}

export function isDrawingEnabled(): boolean {
  return process.env.DRAWING_ENABLED == "true";
}

export function getAwsCredentials(): {
  accessKeyId: string;
  secretAccessKey: string;
} {
  return {
    accessKeyId: assertConfigured("AWS_ACCESS_KEY_ID"),
    secretAccessKey: assertConfigured("AWS_SECRET_ACCESS_KEY"),
  };
}

export function getAwsBucketName(): string {
  return assertConfigured("AWS_BUCKET_NAME");
}

export function getRethinkConfig() {
  return {
    host: assertConfigured("RETHINKDB_HOST"),
    port: z.coerce.number().parse(assertConfigured("RETHINKDB_PORT")),
    name: z.string().optional().parse(process.env.RETHINKDB_NAME),
    password: z.string().optional().parse(process.env.RETHINKDB_PASSWORD),
    username: z.string().optional().parse(process.env.RETHINKDB_USERNAME),
  };
}

function assertConfigured(varName: string): string {
  const value = process.env[varName];
  if (!value) {
    throw new Error(`${varName} is not configured`);
  }
  return value;
}
