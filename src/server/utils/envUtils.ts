export function getOpenAikey(): string {
  return process.env.OPENAI_API_KEY ?? "";
}
