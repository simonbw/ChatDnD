import { DrawingStyle } from "./DrawingStyle";
import { generateImage } from "./generateImage";

export function generateStoryCharacterImage(description: string) {
  return generateImage(description, {
    drawingStyle: DrawingStyle.StoryCharacter,
    shouldRemoveBackground: false,
    s3Folder: "story-images",
  });
}

export function generateStorySceneImage(description: string) {
  return generateImage(description, {
    drawingStyle: DrawingStyle.StoryScene,
    shouldRemoveBackground: false,
    s3Folder: "story-images",
  });
}

export function generatePortraitImage(description: string) {
  return generateImage(description, {
    drawingStyle: DrawingStyle.CharacterPortrait,
    shouldRemoveBackground: false,
    s3Folder: "character-portraits",
  });
}

export function generateInventoryImage(description: string) {
  return generateImage(description, {
    drawingStyle: DrawingStyle.InventoryItem,
    shouldRemoveBackground: false,
    s3Folder: "character-portraits",
  });
}
