import path from "path";

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
  return process.env.GPT_MODEL ?? "";
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
