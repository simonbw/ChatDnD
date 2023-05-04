import { Readable } from "stream";
import {
  RoomMessage,
  WithActions,
  WithImages,
} from "../../common/models/roomModel";
import { Channel } from "../utils/Channel";
import { parseDeltaStream } from "../utils/openAiUtils";
import { GameMasterAction, parseGMAction } from "./GameMasterActions";

type CompleteRoomMessage = RoomMessage & WithImages & WithActions;

function defaultMessage(): CompleteRoomMessage {
  return {
    content: "",
    role: "assistant",
    name: "ChatDnD",
    whispered: false,
    images: [],
    actions: [],
    createdAt: new Date().toISOString(),
  };
}

export type UpdateMessage = (
  updater: (old: CompleteRoomMessage) => CompleteRoomMessage
) => void;

/**
 * Parses a message stream and builds it up piece by piece.
 */
export class RoomMessageBuilder {
  private streamEndPromise: Promise<void>;
  private actionPromises: Promise<void>[] = [];
  onUpdate = new Channel<RoomMessage>();
  message: CompleteRoomMessage = defaultMessage();
  currentActionText: string | undefined = undefined;

  constructor(
    streamOrPromise: Readable | Promise<Readable>,
    private processAction: (
      action: GameMasterAction,
      updateMessage: UpdateMessage
    ) => Promise<void>
  ) {
    this.streamEndPromise = new Promise(async (resolve, reject) => {
      const stream = await Promise.resolve(streamOrPromise);

      stream.on("data", (data: Uint8Array) => {
        for (const delta of parseDeltaStream(data)) {
          if (delta.content) {
            this.updateMessage((m) => ({
              ...m,
              content: m.content + delta.content,
            }));
            for (const char of delta.content) {
              this.addContentCharacter(char);
            }
            this.onUpdate.publish(this.getMessage());
          }
        }
      });

      stream.on("end", () => resolve());
      stream.on("close", () => resolve());
      stream.on("error", (error) => {
        reject(error);
      });
    });
  }

  updateMessage(
    updater: (old: CompleteRoomMessage) => CompleteRoomMessage
  ): RoomMessage {
    this.message = updater(this.message);
    const publicMessage = this.getMessage();
    this.onUpdate.publish(publicMessage);
    return publicMessage;
  }

  addContentCharacter(char: string) {
    if (this.currentActionText === undefined) {
      if (char === "{") {
        this.startAction();
      }
    } else {
      if (char === "}") {
        this.endAction();
      } else {
        this.currentActionText += char;
      }
    }
  }

  startAction() {
    this.currentActionText = "";
  }

  endAction() {
    const action = parseGMAction(this.currentActionText!);
    this.message.actions ??= [];
    this.message.actions.push(action);
    this.currentActionText = undefined;
    this.actionPromises.push(
      this.processAction(action, (updater) => this.updateMessage(updater))
    );
  }

  getMessage(): RoomMessage {
    return {
      ...this.message,
      content: this.message.content || "...",
    };
  }

  async waitTillDone(): Promise<RoomMessage> {
    await this.streamEndPromise;
    await Promise.all(this.actionPromises);
    return this.getMessage();
  }
}
