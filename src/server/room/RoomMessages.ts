import { ChatCompletionRequestMessage } from "openai";
import { RoomMessage, WithId } from "../../common/models/roomModel";
import { last } from "../../common/utils/arrayUtils";
import { WebError } from "../WebError";
import { Channel } from "../utils/Channel";
import { apiSafeName } from "../utils/openAiUtils";
import { RoomMessageBuilder } from "./RoomMessageBuilder";
import { SerializedRoom } from "./roomSerialization";

export class RoomMessages {
  public onUpdate = new Channel<void>();
  public onAddStart = new Channel<RoomMessage>();
  public onAddComplete = new Channel<RoomMessage & WithId>();

  // Serialized Fields
  private messages: RoomMessage[] = [];

  constructor(data: SerializedRoom["messages"]) {
    this.messages = data;
  }

  toJson(): SerializedRoom["messages"] {
    return this.messages;
  }

  /** Adds a single message */
  addMessage(message: RoomMessage, complete = true): RoomMessage & WithId {
    const messageIndex = this.messages.length;
    const newMessage: RoomMessage & WithId = {
      ...message,
      content: message.content.trim(),
      complete,
      id: messageIndex,
    };
    this.messages.push(newMessage);
    this.onUpdate.publish();
    this.onAddStart.publish(newMessage);
    if (complete) {
      this.onAddComplete.publish(newMessage);
    }
    return newMessage;
  }

  /** Adds a message and updates it as the builder works */
  async addMessageAsync(
    messageBuilder: RoomMessageBuilder
  ): Promise<RoomMessage> {
    const messageId = this.addMessage(messageBuilder.getMessage(), false).id;
    messageBuilder.onUpdate.subscribe((message) => {
      this.updateMessage(messageId, message);
    });
    await messageBuilder.waitTillDone();
    const finalMessage = this.updateMessage(messageId, (old) => ({
      ...old,
      complete: true,
    }));
    this.onAddComplete.publish(finalMessage);
    return finalMessage;
  }

  /** Change an existing message. */
  updateMessage(
    messageId: number,
    message: RoomMessage | ((old: RoomMessage) => RoomMessage)
  ) {
    if (!this.messages[messageId]) {
      throw new WebError(
        "Cannot update message that doesn't exist: " + messageId,
        400
      );
    }
    if (typeof message == "function") {
      message = message(this.messages[messageId]);
    }
    const messageToSave = {
      ...message,
      id: messageId,
    };
    this.messages[messageId] = messageToSave;
    this.onUpdate.publish();
    return messageToSave;
  }

  getPublicMessages(): RoomMessage[] {
    return this.messages
      .map(toPublicMessage)
      .filter((message): message is RoomMessage => message != null);
  }

  getAllMessages(): readonly RoomMessage[] {
    return this.messages;
  }

  getApiMessages(): ChatCompletionRequestMessage[] {
    return [
      ...this.messages
        .filter((message) => !message.whispered)
        .map(toApiMessage),
    ];
  }

  getLastApiMessage(): ChatCompletionRequestMessage | undefined {
    return last(this.getApiMessages());
  }

  getApiMessage(index: number): ChatCompletionRequestMessage {
    // TODO: More efficient?
    return this.getApiMessages()[index];
  }
}

function toApiMessage(message: RoomMessage): ChatCompletionRequestMessage {
  return {
    role: message.role,
    name: apiSafeName(message.name),
    content: message.content,
  };
}

function toPublicMessage(message: RoomMessage): RoomMessage | null {
  if (message.role === "system") {
    if (message.publicContent) {
      return {
        ...message,
        content: message.publicContent,
        publicContent: undefined,
      };
    } else {
      // Don't show system messages without public content
      return null;
    }
  } else {
    return message;
  }
}
