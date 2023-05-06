import { InventoryItem } from "../../common/models/characterModel";
import { generateImageStability } from "./generateImage";
import { generateImageDalle } from "./generateImageDalle";

export function generateStoryCharacterImage(description: string) {
  const prompt = `Charcoal sketch, character portrait, white background, ${description}`;
  return generateImageStability(prompt, {
    shouldRemoveBackground: false,
    s3Folder: "story-images",
  });
}

export function generateStorySceneImage(description: string) {
  return generateImageStability(
    `sketch, white background, fantasy art, dungeons and dragons, ${description}`,
    {
      shouldRemoveBackground: false,
      s3Folder: "story-images",
    }
  );
}

export function generatePortraitImage(description: string) {
  return generateImageStability(
    [
      {
        text:
          "sketch, white background, fantasy art, dungeons and dragons, " +
          description,
        weight: 1,
      },
    ],
    {
      shouldRemoveBackground: false,
      s3Folder: "character-portraits",
      // stability: { style_prompt: "fantasy-art" },
    }
  );
}

export function generateInventoryImage(item: InventoryItem) {
  // const prompts = [
  //   {
  //     text: `${item.name} alone on white background, black ink drawing`,
  //     weight: 1,
  //   },
  //   // {
  //   //   text: `photo`,
  //   //   weight: -0.6,
  //   // },
  //   {
  //     text: `man, woman, person`,
  //     weight: -0.4,
  //   },
  // ];
  return generateImageDalle(
    `${item.name} alone on white background, lots of whitespace, pencil drawing, ${item.description}`,
    {
      shouldRemoveBackground: false,
      s3Folder: "inventory-items",
      stability: {
        style_prompt: "fantasy-art",
        clip_guidance_preset: "FAST_GREEN",
        cfg_scale: 5,
      },
    }
  );
}
