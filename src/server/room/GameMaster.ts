import { ChatCompletionRequestMessage } from "openai";
import { Player } from "../../common/models/playerModel";
import { RoomMessage } from "../../common/models/roomModel";
import {
  generateStoryCharacterImage,
  generateStorySceneImage,
} from "../image-generation/generateImageWrappers";
import { makeInitialSystemMessage } from "../prompts/initialPrompts";
import {
  playerJoinMessage,
  playerLeaveMessage,
} from "../prompts/roomEventPrompts";
import { ActionQueue } from "../utils/ActionQueue";
import { streamTextResponse } from "../utils/openAiUtils";
import { GameMasterAction } from "./GameMasterActions";
import { Room } from "./Room";
import { RoomMessageBuilder, UpdateMessage } from "./RoomMessageBuilder";
import { SerializedRoom } from "./roomSerialization";

/** The class in charge of generating responses to players */
export class GameMaster {
  private mainChatQueue = new ActionQueue(); // TODO: Use this
  private room: Room;

  constructor(room: Room, data: SerializedRoom["gameMaster"]) {
    this.room = room;

    this.room.players.onPlayerAdded.subscribe((player) =>
      this.playerAdded(player)
    );
    this.room.players.onPlayerRemoved.subscribe((player) =>
      this.playerRemoved(player)
    );
    this.room.messages.onAddComplete.subscribe((message) => {
      this.messageAdded(message);
    });

    const lastMessage = this.room.messages.getLastApiMessage();
    if (lastMessage && lastMessage.role !== "assistant") {
      this.respond();
    }
  }

  toJson(): SerializedRoom["gameMaster"] {
    return {};
  }

  private async getHistory(): Promise<ChatCompletionRequestMessage[]> {
    const allMessages = this.room.messages.getApiMessages();
    const splitIndex = this.getHistorySplitIndex();

    const summary =
      splitIndex == 0
        ? ""
        : await this.room.summaryHistory.getSummary(splitIndex - 1);
    const lastChats = allMessages.slice(splitIndex);

    // We can include all messages, no summary needed
    return [
      ...makeInitialSystemMessage(
        this.room.name,
        this.room.players.all,
        summary
      ),
      ...lastChats,
    ];
  }

  private getHistorySplitIndex() {
    // TODO: Choose number of conversations
    const allMessages = this.room.messages.getApiMessages();
    let count = 0;
    let index = allMessages.length - 1;

    while (index > 0 && count < 800) {
      index -= 1;
      count += allMessages[index].content.length;
    }

    return index;
  }

  private async respond(
    additionalMessages: ChatCompletionRequestMessage[] = []
  ) {
    const streamPromise = streamTextResponse([
      ...(await this.getHistory()),
      ...additionalMessages,
    ]);
    const messageBuilder = new RoomMessageBuilder(
      streamPromise,
      (action, updateMessage) => this.processAction(action, updateMessage)
    );
    await this.room.messages.addMessageAsync(messageBuilder);
  }

  private async processAction(
    action: GameMasterAction,
    updateMessage: UpdateMessage
  ) {
    switch (action.name) {
      case "DrawCharacter": {
        const description = action.args[0];
        const imageUrl = await generateStoryCharacterImage(description);
        const newImage = { description: description, url: imageUrl };
        updateMessage((old) => ({
          ...old,
          images: [...old.images, newImage],
        }));
        break;
      }
      case "DrawScene": {
        const description = action.args[0];
        const imageUrl = await generateStorySceneImage(description);
        const newImage = { description: description, url: imageUrl };
        updateMessage((old) => ({
          ...old,
          images: [...old.images, newImage],
        }));
        break;
      }
      case "GiveItem": {
        const [characterName, itemName, itemDescription, quantity] =
          action.args;

        const playerId = this.room.players.byCharacterName(characterName)?.id;

        if (playerId) {
          this.room.players.giveItem(playerId, {
            name: itemName,
            description: itemDescription,
            quantity: Number(quantity) || 1,
          });
        } else {
          console.warn(
            "[GameMaster] Trying to give item to non-existant character:",
            characterName
          );
        }
        break;
      }
      case "RemoveItem": {
        const [characterName, itemName, quantity] = action.args;

        const playerId = this.room.players.byCharacterName(characterName)?.id;

        if (playerId) {
          this.room.players.removeItem(playerId, {
            name: itemName,
            quantity: Number(quantity) || Infinity,
          });
        } else {
          console.warn(
            "[GameMaster] Trying to remove item from non-existant character:",
            characterName
          );
        }
        break;
      }
    }
  }

  async messageAdded(message: RoomMessage) {
    // TODO: Action queue?
    if (message.role !== "assistant" && !message.whispered) {
      await this.respond();
    }
  }

  async playerAdded(player: Player) {
    const otherPlayers = this.room.players.all.filter((p) => p.id != player.id);
    this.room.messages.addMessage(playerJoinMessage(player, otherPlayers));
  }

  async playerRemoved(player: Player) {
    this.room.messages.addMessage(playerLeaveMessage(player));
  }
}
