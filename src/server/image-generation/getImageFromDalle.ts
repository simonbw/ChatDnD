import { WebError } from "../WebError";
import { openAi } from "../utils/openAiUtils";

export async function getImageFromDalle(prompt: string): Promise<string> {
  console.log(`[generateImage] DALL-E drawing image with prompt: ${prompt}`);
  let apiResponse;
  try {
    apiResponse = await openAi().createImage({
      prompt: prompt,
      n: 1,
      response_format: "url",
      size: "512x512",
    });
  } catch (error) {
    console.error("Request to DALL-E failed:", prompt);
    throw new WebError("Request to DALL-E failed:" + error, 500);
  }

  const url = apiResponse.data.data[0].url!;
  if (!url) {
    throw new WebError("Failed to draw image", 500);
  }
  return url;
}
