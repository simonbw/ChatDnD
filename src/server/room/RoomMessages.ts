import { ChatCompletionRequestMessage } from "openai";
import {
  RoomMessage,
  RoomMessageId,
  WithId,
} from "../../common/models/roomModel";
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
    messageId: RoomMessageId,
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

  get length(): number {
    return this.messages.length;
  }

  getAll(): readonly RoomMessage[] {
    return this.messages;
  }

  getMessageById(messageId: RoomMessageId): RoomMessage | undefined {
    return this.messages[messageId];
  }

  hasMessage(messageId: RoomMessageId): boolean {
    return this.messages[messageId] != undefined;
  }

  getApiMessageById(
    messageId: RoomMessageId
  ): ChatCompletionRequestMessage | undefined {
    const message = this.getMessageById(messageId);
    if (!message) {
      return undefined;
    }
    return toApiMessage(message);
  }

  getPublicMessageById(messageId: RoomMessageId): RoomMessage | undefined {
    const message = this.messages[messageId];
    if (!message) {
      return undefined;
    }
    return toPublicMessage(message);
  }

  getAllPublicMessages(): RoomMessage[] {
    return this.messages
      .map(toPublicMessage)
      .filter((message): message is RoomMessage => message != null);
  }

  /**
   * Returns all API messages that occur before the message with the given id.
   */
  getApiMessagesBefore(
    messageId: RoomMessageId
  ): ChatCompletionRequestMessage[] {
    return this.messages
      .slice(messageId)
      .map(toApiMessage)
      .filter((m) => m != undefined);
  }

  /**
   * Returns the most recent API message, or undefined if there are no API messages.
   */
  getLastApiMessage(): ChatCompletionRequestMessage | undefined {
    return this.messages.findLast((m) => toApiMessage(m) !== undefined);
  }
}

/**
 * Converts a message to one for the API to see, or undefined if it's not for the API to see.
 */
export function toApiMessage(
  message: RoomMessage
): ChatCompletionRequestMessage {
  return {
    role: message.role,
    name: apiSafeName(message.name),
    content: message.content,
  };
}

/**
 * Converts a message to one for users to see, or undefined if it's not meant to be seen.
 */
export function toPublicMessage(message: RoomMessage): RoomMessage | undefined {
  if (message.role === "system") {
    if (message.publicContent) {
      return {
        ...message,
        content: message.publicContent,
        publicContent: undefined,
      };
    } else {
      // Don't show system messages without public content
      return undefined;
    }
  } else {
    return message;
  }
}
