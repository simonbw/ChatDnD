import { WebError } from "../WebError";
import { getGenerationGPTModel } from "../utils/envUtils";
import { cleanupChatResponse, openAi } from "../utils/openAiUtils";

export async function generateCampaignName(): Promise<string> {
  let content: string | undefined = undefined;
  try {
    const response = await openAi().createChatCompletion({
      model: getGenerationGPTModel(),
      messages: [
        {
          role: "user",
          content:
            "Please come up with a unique title for a Dungeons & Dragons campaign. Please respond with only the title, and no punctuation.",
        },
      ],
    });

    content = response.data.choices[0].message?.content;
  } catch (error: any) {
    if (!content) {
      throw new WebError("Error while generating name " + error.message, 500);
    }
  }

  if (!content) {
    throw new WebError(
      "Error while generating name. API returned no content.",
      500
    );
  }

  return cleanupChatResponse(content, { singlePhrase: true });
}
