import type { InventoryItem } from "../../src/common/models/characterModel";
import { internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { getRoomPlayers } from "./roomHelpers";

/**
 * Finds a player in a room by their character's name (case-insensitive).
 * The GM sometimes names the player instead of the character in actions, so
 * the player's own name is accepted as a fallback.
 */
export async function findByCharacterName(
  ctx: MutationCtx,
  roomId: Id<"rooms">,
  characterName: string
): Promise<Doc<"players"> | undefined> {
  const players = await getRoomPlayers(ctx, roomId);
  const normalize = (name: string) => name.trim().toLocaleLowerCase();
  const wanted = normalize(characterName);
  return (
    players.find((p) => normalize(p.character.name) === wanted) ??
    players.find((p) => normalize(p.name) === wanted)
  );
}

export async function giveItem(
  ctx: MutationCtx,
  roomId: Id<"rooms">,
  characterName: string,
  item: Pick<InventoryItem, "name" | "description" | "quantity">
): Promise<void> {
  const player = await findByCharacterName(ctx, roomId, characterName);
  if (!player) {
    console.warn(
      "[inventory] Giving item to unknown character:",
      characterName
    );
    return;
  }

  const inventory = player.character.inventory;
  const existing = inventory.find((i) => i.name === item.name);
  if (existing) {
    await setInventory(
      ctx,
      player,
      inventory.map((i) =>
        i === existing ? { ...i, quantity: i.quantity + item.quantity } : i
      )
    );
  } else {
    await setInventory(ctx, player, [...inventory, item]);
    await scheduleItemDrawing(ctx, player._id, item);
  }
}

/** Removes `quantity` of an item, or all of it when `quantity` is undefined. */
export async function removeItem(
  ctx: MutationCtx,
  roomId: Id<"rooms">,
  characterName: string,
  itemName: string,
  quantity: number | undefined
): Promise<void> {
  const player = await findByCharacterName(ctx, roomId, characterName);
  if (!player) {
    console.warn(
      "[inventory] Removing item from unknown character:",
      characterName
    );
    return;
  }

  const inventory = player.character.inventory;
  const existing = inventory.find((i) => i.name === itemName);
  if (!existing) {
    return;
  }
  if (quantity !== undefined && existing.quantity > quantity) {
    await setInventory(
      ctx,
      player,
      inventory.map((i) =>
        i === existing ? { ...i, quantity: i.quantity - quantity } : i
      )
    );
  } else {
    await setInventory(
      ctx,
      player,
      inventory.filter((i) => i !== existing)
    );
  }
}

export async function setInventory(
  ctx: MutationCtx,
  player: Doc<"players">,
  inventory: InventoryItem[]
): Promise<void> {
  await ctx.db.patch(player._id, {
    character: { ...player.character, inventory },
  });
}

export async function scheduleItemDrawing(
  ctx: MutationCtx,
  playerDocId: Id<"players">,
  item: Pick<InventoryItem, "name" | "description">
): Promise<void> {
  await ctx.scheduler.runAfter(0, internal.players.drawItem, {
    playerDocId,
    itemName: item.name,
    itemDescription: item.description,
  });
}
