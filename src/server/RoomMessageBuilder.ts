import { z } from "zod";
import { RoomMessage, roomMessageRoleSchema } from "../common/models/roomModel";
import { getDrawnImage } from "./getDrawnImage";

export class RoomMessageBuilder {
  message: RoomMessage & { images: Exclude<RoomMessage["images"], undefined> } =
    {
      content: "",
      role: "assistant",
      name: "ChatDnD",
      secret: false,
      images: [],
    };

  currentImageDescription: string | undefined = undefined;

  constructor(private onUpdate: () => void) {}

  addDelta(delta: StreamMessageDelta) {
    if (delta.role) {
      this.message.role = roomMessageRoleSchema.parse(delta.role);
    }
    if (delta.name) {
      this.message.name = delta.name;
    }

    if (delta.content) {
      this.message.content += delta.content;
      for (const char of delta.content) {
        this.addContentCharacter(char);
      }
    }

    this.onUpdate();
  }

  addContentCharacter(char: string) {
    if (this.currentImageDescription === undefined) {
      if (char === "{") {
        this.startImageDescription();
      }
    } else {
      if (char === "}") {
        this.endImageDescription();
      } else {
        this.currentImageDescription += char;
      }
    }
  }

  startImageDescription() {
    this.currentImageDescription = "";
  }

  endImageDescription() {
    this.message.images.push({
      description: this.currentImageDescription!,
    });
    this.drawImage(this.message.images.length - 1);

    this.currentImageDescription = undefined;
  }

  async drawImage(imageIndex: number) {
    const image = this.message.images[imageIndex];

    this.message.images[imageIndex] = {
      ...image,
      url: await getDrawnImage(image.description),
    };

    this.onUpdate();
  }

  async end() {}

  getMessage(): RoomMessage {
    return {
      role: this.message.role,
      secret: this.message.secret,
      name: this.message.name,
      images: this.message.images,
      content:
        this.message.content +
        (this.currentImageDescription != undefined ? "[drawing]" : ""),
    };
  }
}

export const streamMessageDeltaSchema = z.object({
  content: z.string().optional(),
  role: z.string().optional(),
  name: z.string().optional(),
});

export type StreamMessageDelta = z.infer<typeof streamMessageDeltaSchema>;

export const streamMessageSchema = z.object({
  id: z.string(),
  object: z.string(),
  created: z.number(),
  model: z.string(),
  choices: z.array(
    z.object({
      delta: streamMessageDeltaSchema,
      index: z.number(),
      finish_reason: z.union([
        z.literal("stop"),
        z.literal("length"),
        z.literal("content_filter"),
        z.null(),
      ]),
    })
  ),
});
