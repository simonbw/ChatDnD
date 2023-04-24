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
      return `2d high quality drawing character portrait. Fantasy roleplaying game character art. Full face and shoulders in frame. The subject of the portrait: "${description}"`;
  }
}
