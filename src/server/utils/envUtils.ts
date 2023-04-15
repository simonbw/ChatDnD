import path from "path";

export function getOpenAiKey(): string {
  return process.env.OPENAI_API_KEY ?? "";
}

export function getElevenLabsKey(): string {
  return process.env.ELEVEN_LABS_KEY ?? "";
}

export function getDrawnImageFolder(): string {
  return path.join(__dirname, "../../dist/client/images/drawn");
}
