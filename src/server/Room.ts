import { AxiosResponse } from "axios";
import { ChatCompletionRequestMessage } from "openai";
import { Readable } from "stream";
import { RoomMessage, RoomState } from "../common/models/roomModel";
import { last } from "../common/utils/arrayUtils";
import { RoomMessageBuilder } from "./RoomMessageBuilder";
import {
  makeChooseNameMessage,
  makeStarterMessages,
  playerJoinMessage,
  playerLeaveMessage,
} from "./prompts";
import { ActionQueue } from "./utils/ActionQueue";
import { Channel } from "./utils/Channel";
import { getGPTModel } from "./utils/envUtils";
import { apiSafeName, openAi, parseDeltaStream } from "./utils/openAiUtils";

interface Player {
  id: string;
  name: string;
}

export class Room {
  public channel: Channel<RoomState> = new Channel();
  public name: string;
  private messages: RoomMessage[] = [];
  private players: Player[] = [];
  public createdAt = new Date().toISOString();

  private mainChatQueue = new ActionQueue();

  constructor(public readonly id: string) {
    this.name = "";
    this.mainChatQueue.addToQueue(() => this.decideOnName());
    this.mainChatQueue.addToQueue(async () => {
      this.messages.push(...makeStarterMessages(this.name));
    });
  }

  async decideOnName() {
    const response = await openAi().createChatCompletion({
      model: getGPTModel(),
      messages: makeChooseNameMessage(),
    });

    const content = response.data.choices[0].message?.content;

    if (!content) {
      throw new Error("API returned no message");
    }

    this.name = cleanupName(content);

    this.publish();
  }

  addMessage(message: RoomMessage) {
    const messageIndex = this.messages.length;
    this.messages.push(message);
    this.publish();
    return messageIndex;
  }

  addPlayer(player: Player) {
    this.players.push(player);
    this.addMessage(playerJoinMessage(player));
    this.getDmMessage();
  }

  removePlayer(player: Player) {
    this.players.filter((p) => p.id != player.id);
    this.addMessage(playerLeaveMessage(player));
    this.getDmMessage();
  }

  getPlayers() {
    return this.players;
  }

  updateMessage(
    messageIndex: number,
    message: RoomMessage | ((old: RoomMessage) => RoomMessage)
  ) {
    if (typeof message == "function") {
      this.messages[messageIndex] = message(this.messages[messageIndex]);
    } else {
      this.messages[messageIndex] = message;
    }
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
      id: this.id,
      name: this.name,
      players: this.players.map((p) => p.name),
      createdAt: this.createdAt,
    };
  }

  getApiMessages(): ChatCompletionRequestMessage[] {
    return [
      ...this.messages
        .filter((message) => !message.secret)
        .map((message) => ({
          role: message.role,
          name: apiSafeName(message.name),
          content: message.content,
        })),
    ];
  }

  async getDmMessage(skipIfDuplicate: boolean = true) {
    await this.mainChatQueue.addToQueue(() => {
      return new Promise(async (resolve) => {
        if (
          skipIfDuplicate &&
          last(this.getApiMessages())?.role === "assistant"
        ) {
          // Don't have ChatDnD send two messages in a row. It should be able to respond to both just fine.
          return resolve();
        }

        // TODO: Locking on this
        const messageIndex = this.addMessage({
          role: "assistant",
          name: "ChatDnD",
          content: "...",
          createdAt: new Date().toISOString(),
          secret: true,
        });

        const messageBuilder = new RoomMessageBuilder(() => {
          const message = messageBuilder.getMessage();
          this.updateMessage(messageIndex, message);
        });

        const chat = (await openAi().createChatCompletion(
          {
            stream: true,
            model: getGPTModel(),
            messages: this.getApiMessages(),
          },
          { responseType: "stream" }
        )) as any as AxiosResponse<Readable>;

        chat.data.on("data", (data: Uint8Array) => {
          for (const delta of parseDeltaStream(data)) {
            messageBuilder.addDelta(delta);
          }
        });

        chat.data.on("end", () => {
          messageBuilder.end();
          resolve();
        });
      });
    });
  }

  // For debugging only. Doesn't draw images.
  async getDmMessageSync() {
    // TODO: Locking on this
    const messageIndex = this.addMessage({
      role: "assistant",
      name: "ChatDnD",
      content: "...",
      createdAt: new Date().toISOString(),
      secret: true,
    });

    const chat = await openAi().createChatCompletion({
      model: getGPTModel(),
      messages: this.getApiMessages(),
    });
    const content = chat.data.choices[0].message?.content ?? "";
    this.updateMessage(messageIndex, (old) => ({
      ...old,
      content,
    }));
  }
}

function cleanupName(name: string): string {
  let result = name;
  // Get rid of quotes
  result = result.replace(/"/g, "");
  if (last(result) == ".") {
    result = result.substring(0, result.length - 1);
  }

  return result;
}
