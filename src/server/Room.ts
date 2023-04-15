import { AxiosResponse } from "axios";
import { ChatCompletionRequestMessage } from "openai";
import { Readable } from "stream";
import { RoomMessage, RoomState } from "../common/models/roomModel";
import {
  RoomMessageBuilder,
  StreamMessageDelta,
  streamMessageSchema,
} from "./RoomMessageBuilder";
import { makeStarterMessages } from "./first-message";
import { Channel } from "./utils/Channel";
import { openAi } from "./utils/openAiUtils";

export class Room {
  public channel: Channel<RoomState> = new Channel();

  private messages: RoomMessage[] = [];

  constructor(public readonly id: string) {
    this.messages.push(...makeStarterMessages());
    this.getDmMessage();
  }

  addMessage(message: RoomMessage) {
    const messageIndex = this.messages.length;
    this.messages.push(message);
    this.publish();
    return messageIndex;
  }

  updateMessage(messageIndex: number, message: RoomMessage) {
    this.messages[messageIndex] = message;
    this.publish();
  }

  publish() {
    // TODO: Don't publish whole state every time?
    this.channel.publish(this.getPublicState());
  }

  getPublicState(): RoomState {
    const publicMessages: RoomMessage[] = this.messages.filter(
      (message) => message.role != "system"
    );
    return {
      messages: publicMessages,
    };
  }

  getChatMessages(): ChatCompletionRequestMessage[] {
    return [
      ...this.messages
        .filter((m) => !m.secret)
        .map((m) => ({
          content: m.content,
          name: m.name,
          role: m.role,
        })),
    ];
  }

  async getDmMessage() {
    const messageIndex = this.addMessage({
      role: "assistant",
      name: "ChatDnD",
      content: "...",
      secret: true,
    });

    const messageBuilder = new RoomMessageBuilder(() => {
      const message = messageBuilder.getMessage();
      this.updateMessage(messageIndex, message);
    });

    const chat = (await openAi().createChatCompletion(
      {
        stream: true,
        model: "gpt-3.5-turbo",
        // model: "gpt-4",
        messages: this.getChatMessages(),
      },
      { responseType: "stream" }
    )) as any as AxiosResponse<Readable>;

    chat.data.on("data", (data: Uint8Array) => {
      const deltas = parseDeltaStream(data);

      for (const delta of deltas) {
        messageBuilder.addDelta(delta);
      }
    });

    chat.data.on("end", () => {
      messageBuilder.end();
    });
  }
}

export function parseDeltaStream(raw: Uint8Array): StreamMessageDelta[] {
  const lines = raw
    .toString()
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

  return lines
    .map((rawLine) => {
      if (rawLine.includes("[DONE]")) {
        return null;
      }

      const line = rawLine.replace(/^data: /, "");

      try {
        const data = streamMessageSchema.parse(JSON.parse(line));
        return data.choices[0].delta;
      } catch (e) {
        console.log("failed to parse:\n", line, "\n\n");
        return null;
      }
    })
    .filter((delta): delta is StreamMessageDelta => delta != null);
}
