import iassign from "immutable-assign";
import { InventoryItem } from "../../common/models/characterModel";
import { Player } from "../../common/models/playerModel";
import { WebError } from "../WebError";
import { generateInventoryImage } from "../image-generation/generateImageWrappers";
import { Channel } from "../utils/Channel";
import { SerializedRoom } from "./roomSerialization";

export class RoomPlayers {
  public readonly onUpdate = new Channel<void>();
  public readonly onPlayerAdded = new Channel<Player>();
  public readonly onPlayerRemoved = new Channel<Player>();

  private players = new Map<string, Player>();

  constructor(data: SerializedRoom["players"]) {
    for (const player of data) {
      this.players.set(player.id, player);
    }
  }

  toJson(): SerializedRoom["players"] {
    return this.all;
  }

  byCharacterName(characterName: string): Player | undefined {
    return this.all.find(
      (player) =>
        player.character.name.toLocaleLowerCase() ===
        characterName.toLocaleLowerCase()
    );
  }

  byId(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  async giveItem(playerId: string, itemToAdd: InventoryItem) {
    const player = this.byId(playerId);
    if (!player) {
      console.warn("Giving item to non-existant player", playerId);
      return;
    }

    const itemIndex = player.character.inventory.findIndex(
      (item) => item.name === itemToAdd.name
    );
    if (itemIndex >= 0) {
      // Existing item, update quatnity
      this.update(
        player.id,
        iassign(
          player,
          (p) => p.character.inventory[itemIndex].quantity,
          (quantity) => quantity + itemToAdd.quantity
        )
      );
    } else {
      const index = player.character.inventory.length;
      this.update(
        player.id,
        iassign(
          player,
          (p) => p.character.inventory,
          (inventory) => [...inventory, itemToAdd]
        )
      );
      // Make sure we add an image if it doesn't already have one.
      if (!itemToAdd.imageUrl) {
        generateInventoryImage(itemToAdd).then((imageUrl) =>
          this.update(player.id, (p) =>
            iassign(
              p,
              (p) => p.character.inventory[index].imageUrl,
              () => imageUrl
            )
          )
        );
      }
    }
  }

  async redrawInventory(playerId: string) {
    const player = this.byId(playerId);

    if (!player) {
      console.warn("Player doesn't exist:", playerId);
      return;
    }

    const promises = player.character.inventory.map(async (item, index) => {
      const imageUrl = await generateInventoryImage(item);
      this.update(player.id, (p) =>
        iassign(
          p,
          (p) => p.character.inventory[index].imageUrl,
          () => imageUrl
        )
      );
    });

    await Promise.all(promises);
  }

  async removeItem(
    playerId: string,
    itemToRemove: Pick<InventoryItem, "name" | "quantity">
  ) {
    const player = this.byId(playerId);
    if (player) {
      const existingItemIndex = player.character.inventory.findIndex(
        (item) => item.name === itemToRemove.name
      );
      if (existingItemIndex >= 0) {
        const existingItem = player.character.inventory[existingItemIndex];
        if (existingItem.quantity > itemToRemove.quantity) {
          this.update(
            player.id,
            iassign(
              player,
              (p) => p.character.inventory[existingItemIndex].quantity,
              (quantity) => quantity - itemToRemove.quantity
            )
          );
        } else {
          // remove completely
          this.update(
            player.id,
            iassign(
              player,
              (p) => p.character.inventory,
              (inventory) =>
                inventory.filter((item) => item.name !== itemToRemove.name)
            )
          );
        }
      }
    }
  }

  /** Change an existing message. */
  update(
    playerId: string,
    updatedPlayer: Player | ((old: Player) => Player)
  ): Player {
    if (!this.byId(playerId)) {
      throw new WebError(
        "Cannot update player that doesn't exist: " + playerId,
        400
      );
    }
    if (typeof updatedPlayer == "function") {
      return this.update(playerId, updatedPlayer(this.byId(playerId)!));
    }
    const playerToSave = {
      ...updatedPlayer,
      id: playerId,
    };
    this.players.set(playerId, playerToSave);
    this.onUpdate.publish();
    return playerToSave;
  }

  add(player: Player) {
    player = { ...player };
    if (!this.players.has(player.id)) {
      this.players.set(player.id, player);
      this.onPlayerAdded.publish(player);
      this.onUpdate.publish();
    } else {
      throw new WebError(`Player already added: ${player.id}`, 400);
    }
  }

  remove(playerId: string) {
    if (this.players.has(playerId)) {
      const player = this.byId(playerId)!;
      this.players.delete(playerId);
      this.onPlayerRemoved.publish(player);
      this.onUpdate.publish();
    } else {
      throw new WebError(`Cannot remove player not in game: ${playerId}`, 400);
    }
  }

  get all() {
    return [...this.players.values()];
  }

  get length() {
    return this.players.size;
  }
}
