import { generateImage } from "./generateImage";

export function generateStoryCharacterImage(description: string) {
  const prompt = `Masterpiece charcoal sketch character portrait. White background. ${description}`;
  return generateImage(prompt, {
    shouldRemoveBackground: false,
    s3Folder: "story-images",
  });
}

export function generateStorySceneImage(description: string) {
  const prompt = `High quality medieval painting on a white background. ${description}`;
  return generateImage(prompt, {
    shouldRemoveBackground: false,
    s3Folder: "story-images",
  });
}

export function generatePortraitImage(description: string) {
  const prompt = `Fantasy character art. Character portrait. Dungeons and Dragons. White background. Dramatic lighting. Looking left. ${description}`;
  return generateImage(prompt, {
    shouldRemoveBackground: false,
    s3Folder: "character-portraits",
  });
}

export function generateInventoryImage(description: string) {
  const prompt = `Masterpiece charcoal drawing. Item on white background. "${description}"`;
  return generateImage(prompt, {
    shouldRemoveBackground: false,
    s3Folder: "character-portraits",
  });
}

`Fantasy character portrait. Detailed, realistic oil painting. Dramatic lighting. `;
