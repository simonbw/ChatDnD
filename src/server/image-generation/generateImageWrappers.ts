import { generateImage } from "./generateImage";

export function generateStoryCharacterImage(description: string) {
  const prompt = `Masterpiece charcoal sketch character portrait. White background. The drawing is of "${description}"`;
  return generateImage(prompt, {
    shouldRemoveBackground: false,
    s3Folder: "story-images",
  });
}

export function generateStorySceneImage(description: string) {
  const prompt = `high quality medieval painting on a white background. The drawing is of "${description}"`;
  return generateImage(prompt, {
    shouldRemoveBackground: false,
    s3Folder: "story-images",
  });
}

export function generatePortraitImage(description: string) {
  const prompt = `Fantasy character portrait. Concept Art. Realistic painting. ${description}`;
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
