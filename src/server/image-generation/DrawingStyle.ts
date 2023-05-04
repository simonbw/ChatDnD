export enum DrawingStyle {
  Plain,
  CharacterPortrait,
  StoryCharacter,
  StoryScene,
  InventoryItem,
}

export function createDrawingPrompt(
  description: string,
  drawingStyle: DrawingStyle
): string {
  switch (drawingStyle) {
    case DrawingStyle.Plain:
      return description;
    case DrawingStyle.StoryScene:
      return `high quality medieval painting on a white background. The drawing is of "${description}"`;
    case DrawingStyle.StoryCharacter:
      return `Masterpiece charcoal sketch character portrait. White background. The drawing is of "${description}"`;
    case DrawingStyle.CharacterPortrait:
      return `Fantasy character portrait. Concept Art. Realistic painting. ${description}`;
    case DrawingStyle.InventoryItem:
      return `Masterpiece charcoal drawing. Item on white background. "${description}"`;
  }
}
