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
  return process.env.OPENAI_API_KEY ?? "";
}

export function getElevenLabsKey(): string {
  return process.env.ELEVEN_LABS_KEY ?? "";
}

export function getGPTModel(): string {
  return process.env.GPT_MODEL ?? "gpt-3.5-turbo";
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

export function getImageBucketName(): string {
  return process.env.S3_BUCKET_NAME ?? "";
}

export function getImageBucketArn(): string {
  return process.env.S3_BUCKET_ARN ?? "";
}

export function getRethinkConfig() {
  return {
    host: z.string().parse(process.env.RETHINKDB_HOST),
    port: z.coerce.number().parse(process.env.RETHINKDB_PORT),
    name: z.string().optional().parse(process.env.RETHINKDB_NAME),
    password: z.string().optional().parse(process.env.RETHINKDB_PASSWORD),
    username: z.string().optional().parse(process.env.RETHINKDB_USERNAME),
  };
}
