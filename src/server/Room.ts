import { AxiosResponse } from "axios";
import { ChatCompletionRequestMessage } from "openai";
import { Readable } from "stream";
import { Player } from "../common/models/playerModel";
import { RoomMessage, RoomState } from "../common/models/roomModel";
import { last } from "../common/utils/arrayUtils";
import { RoomMessageBuilder } from "./RoomMessageBuilder";
import { WebError } from "./WebError";
import {
  makeChooseNameMessage,
  makeStarterMessages,
  playerJoinMessage,
  playerLeaveMessage,
} from "./prompts/initialPrompts";
import { ActionQueue } from "./utils/ActionQueue";
import { Channel } from "./utils/Channel";
import { getGPTModel } from "./utils/envUtils";
import {
  apiSafeName,
  cleanupChatResponse,
  openAi,
  parseDeltaStream,
} from "./utils/openAiUtils";

const ROOM_PLAYER_LIMIT = 6;

export class Room {
  public readonly id: string;
  public readonly channel: Channel<RoomState> = new Channel();
  public name: string = "";
  private messages: RoomMessage[] = [];
  private players: Player[] = [];
  public readonly createdAt = new Date().toISOString();

  private mainChatQueue = new ActionQueue();

  constructor(id: string) {
    this.id = id;
  }

  async init() {
    await this.mainChatQueue.addToQueue(() => this.decideOnName());
    await this.mainChatQueue.addToQueue(async () => {
      this.messages.push(...makeStarterMessages(this.name));
    });
  }

  async decideOnName() {
    let content: string | undefined = undefined;
    try {
      const response = await openAi().createChatCompletion({
        model: getGPTModel(),
        messages: makeChooseNameMessage(),
      });

      content = response.data.choices[0].message?.content;
    } catch (error: any) {
      if (!content) {
        throw new WebError("Error while generating name " + error.message, 500);
      }
    }

    if (!content) {
      throw new WebError(
        "Error while generating name. API returned no content.",
        500
      );
    }

    this.name = cleanupChatResponse(content, { singlePhrase: true });

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

  getPlayer(playerId: string): Player | undefined {
    return this.players.find((player) => player.id === playerId);
  }

  isOpenToJoin(): boolean {
    return this.players.length < ROOM_PLAYER_LIMIT;
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
    return {
      messages: this.getPublicMessages(),
      id: this.id,
      name: this.name,
      players: this.players,
      createdAt: this.createdAt,
      openToJoin: this.isOpenToJoin(),
    };
  }

  getPublicMessages(): RoomMessage[] {
    return this.messages
      .map((message) => {
        if (message.role === "system") {
          if (message.publicContent) {
            return {
              ...message,
              content: message.publicContent,
              publicContent: undefined,
            };
          }
        } else {
          return message;
        }
      })
      .filter((message): message is RoomMessage => message != null);
  }

  getApiMessages(): ChatCompletionRequestMessage[] {
    return [
      ...this.messages
        .filter((message) => !message.whispered)
        .map((message) => ({
          role: message.role,
          name: apiSafeName(message.name),
          content: message.content,
        })),
    ];
  }

  async getDmMessage(skipIfDuplicate: boolean = true) {
    await this.mainChatQueue.addToQueue(async () => {
      if (
        skipIfDuplicate &&
        last(this.getApiMessages())?.role === "assistant"
      ) {
        // Don't have ChatDnD send two messages in a row.
        return;
      }

      const messageIndex = this.addMessage({
        role: "assistant",
        name: "ChatDnD",
        content: "...",
        createdAt: new Date().toISOString(),
        whispered: true,
      });

      const messageBuilder = new RoomMessageBuilder(() => {
        this.updateMessage(messageIndex, messageBuilder.getMessage());
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

      await new Promise<void>((resolve) => {
        chat.data.on("end", () => {
          messageBuilder.end();
          resolve();
        });
      });
    });
  }

  // For debugging only. Doesn't draw images.
  async getDmMessageSync() {
    const messageIndex = this.addMessage({
      role: "assistant",
      name: "ChatDnD",
      content: "...",
      createdAt: new Date().toISOString(),
      whispered: true,
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
