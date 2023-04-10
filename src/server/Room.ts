import { ChatCompletionRequestMessage } from "openai";
import { RoomMessage, RoomState } from "../common/roomModel";
import { FIRST_MESSAGE } from "./first-message";
import { openAi } from "./openAiConfig";
import { Channel } from "./utils/Channel";
// import { Readable } from "stream";

export class Room {
  public channel: Channel<RoomState> = new Channel();
  public state: RoomState = { messages: [] };

  constructor() {}

  addMessage(message: RoomMessage) {
    this.state.messages.push(message);
    this.publish();
    return this.state.messages.length - 1;
  }

  updateMessage(messageIndex: number, message: RoomMessage) {
    this.state.messages[messageIndex] = message;
    this.publish();
  }

  publish() {
    this.channel.publish(this.state);
  }

  getChatMessages(): ChatCompletionRequestMessage[] {
    return [
      FIRST_MESSAGE,

      ...this.state.messages
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

    const chat = await openAi().createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [...this.getChatMessages()],
    });

    const choice = chat.data.choices[0];
    if (choice.message) {
      this.updateMessage(messageIndex, {
        content: choice.message.content,
        role: choice.message.role,
        name: "ChatDnD",
        secret: false,
      });
    }
  }
}
