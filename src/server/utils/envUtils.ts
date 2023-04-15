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

export function getDrawnImageFolder(): string {
  return path.join(__dirname, "../../dist/client/images/drawn");
}
