export enum DrawingStyle {
  Plain,
  StoryImage,
  CharacterPortrait,
}

export function createDrawingPrompt(
  description: string,
  drawingStyle: DrawingStyle
): string {
  switch (drawingStyle) {
    case DrawingStyle.Plain:
      return description;
    case DrawingStyle.StoryImage:
      return `A medieval painting on a white backround. The drawing is of "${description}"`;
    case DrawingStyle.CharacterPortrait:
      return `A photorealistic portrait of a character. Head and shoulders framing. The subject of the portrait: "${description}"`;
  }
}
